// src/hooks/useMqttClient.js
import { useRef, useState, useCallback } from "react";
import Paho from "paho-mqtt";
import { secureRandomString } from "./utils";

export const useMqttClient = ({
  onMessageArrivedCallback,
  onConnectionLostCallback,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedTopics, setSubscribedTopics] = useState([]);
  const clientRef = useRef(null);
  const connectionAttemptRef = useRef(false); // ✅ Track connection attempts
  const reconnectTimeoutRef = useRef(null);

  // clientRef.current.onMessageArrived/onConnectionLost are only ever
  // assigned once, inside connectToMqtt, which itself only runs on the
  // very first successful connection (guarded against reconnecting).
  // Routing every call through these refs — updated on every render,
  // unlike the Paho client's handler properties — means the live client
  // always calls whatever closure is current (fresh currentUserId, etc.)
  // instead of being permanently frozen to whichever render happened to
  // be active at first connect.
  const onMessageArrivedCallbackRef = useRef(onMessageArrivedCallback);
  onMessageArrivedCallbackRef.current = onMessageArrivedCallback;

  const onConnectionLostCallbackRef = useRef(onConnectionLostCallback);
  onConnectionLostCallbackRef.current = onConnectionLostCallback;

  const userProfileData = JSON.parse(
    sessionStorage.getItem("user_profile_data")
  );
  let user_name = userProfileData?.firstName + " " + userProfileData?.lastName;

  const subscribeToTopics = useCallback(
    (topics = []) => {
      if (!clientRef.current || !clientRef.current.isConnected()) return;

      topics.forEach((topic) => {
        if (!subscribedTopics.includes(topic)) {
          clientRef.current.subscribe(topic, {
            qos: 0,
            onSuccess: () => {
              console.log("✅ Subscribed to topic:", topic);
              setSubscribedTopics((prev) =>
                Array.from(new Set([...prev, topic]))
              );
            },
            onFailure: (err) => {
              console.error(
                `❌ Failed to subscribe: ${topic}`,
                err?.errorMessage
              );
            },
          });
        }
      });
    },
    [subscribedTopics]
  );

  const unsubscribeFromTopics = useCallback(
    (topics = []) => {
      if (!clientRef.current || !isConnected) return;

      topics.forEach((topic) => {
        clientRef.current.unsubscribe(topic, {
          onSuccess: () => {
            console.log("✅ Unsubscribed from topic:", topic);
            setSubscribedTopics((prev) => prev.filter((t) => t !== topic));
          },
          onFailure: (err) => {
            console.error(
              `❌ Failed to unsubscribe: ${topic}`,
              err?.errorMessage
            );
          },
        });
      });
    },
    [isConnected]
  );

  const onMessageArrived = useCallback((message) => {
    try {
      const parsed = JSON.parse(message.payloadString);
      console.log("📨 MQTT message arrived:", parsed);
      // Always call the LATEST callback (via ref), not whichever one was
      // closed over when this handler got bound to the Paho client.
      if (onMessageArrivedCallbackRef.current) {
        onMessageArrivedCallbackRef.current(parsed);
      }
    } catch (err) {
      console.error("❌ Failed to parse message:", err);
    }
  }, []);

  const onConnectionLost = useCallback((resObj) => {
    console.warn("🔌 MQTT connection lost:", resObj?.errorMessage);
    setIsConnected(false);
    setSubscribedTopics([]);
    connectionAttemptRef.current = false; // ✅ Reset on connection loss

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (onConnectionLostCallbackRef.current) {
      onConnectionLostCallbackRef.current(resObj);
    }
  }, []);

  const connectToMqtt = useCallback(
    ({ topic, userID }) => {
      // ✅ Prevent multiple connection attempts
      if (!topic || isConnected || connectionAttemptRef.current) {
        console.log(
          "🚫 Connection attempt prevented - already connected or attempting"
        );
        return;
      }

      connectionAttemptRef.current = true;
      console.log("🔗 Attempting MQTT connection...");

      const mqttPort = JSON.parse(sessionStorage.getItem("user_mqtt_Port"));
      const mqttHost = JSON.parse(
        sessionStorage.getItem("user_mqtt_ip_Address")
      );
      const newClientID = secureRandomString();

      console.log("🌐 MQTT Config:", {
        host: mqttHost,
        port: mqttPort,
        clientID: newClientID,
        topic,
      });

      // ✅ Guard against invalid values
      if (
        !mqttHost ||
        typeof mqttHost !== "string" ||
        mqttHost.trim() === "" ||
        !mqttPort ||
        isNaN(Number(mqttPort)) ||
        Number(mqttPort) <= 0
      ) {
        console.warn("⚠️ MQTT host/port not set. Skipping connection.", {
          mqttHost,
          mqttPort,
        });
        return;
      }

      clientRef.current = new Paho.Client(
        mqttHost,
        Number(mqttPort),
        newClientID
      );

      clientRef.current.onConnectionLost = onConnectionLost;
      clientRef.current.onMessageArrived = onMessageArrived;

      clientRef.current.connect({
        onSuccess: () => {
          console.log("✅ MQTT connected successfully:", newClientID);
          setIsConnected(true);
          connectionAttemptRef.current = false;
          subscribeToTopics([topic]);
        },
        onFailure: (err) => {
          console.error("❌ MQTT connection failed:", err.errorMessage);
          setIsConnected(false);
          connectionAttemptRef.current = false; // ✅ Reset on failure

          // Clear previous timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          // Retry after 6 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 Retrying MQTT connection...");
            connectToMqtt({ topic, userID });
          }, 6000);
        },
        keepAliveInterval: 300,
        userName: import.meta.env.VITE_MQTT_USERNAME,
        password: import.meta.env.VITE_MQTT_PASSWORD,
        cleanSession: true,
        useSSL: false,
        reconnect: true,
      });
    },
    [isConnected, onMessageArrived, onConnectionLost, subscribeToTopics]
  );

  // Cleanup on unmount
  const disconnect = useCallback(() => {
    if (clientRef.current && clientRef.current.isConnected()) {
      clientRef.current.disconnect();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
    setSubscribedTopics([]);
    connectionAttemptRef.current = false;
  }, []);

  return {
    client: clientRef.current,
    isConnected,
    connectToMqtt,
    disconnect,
    subscribeToTopics,
    unsubscribeFromTopics,
    onMessageArrived,
    onConnectionLost,
  };
};
