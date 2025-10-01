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

  const onMessageArrived = useCallback(
    (message) => {
      try {
        const parsed = JSON.parse(message.payloadString);
        console.log("📨 MQTT message arrived:", parsed);
        if (onMessageArrivedCallback) onMessageArrivedCallback(parsed);
      } catch (err) {
        console.error("❌ Failed to parse message:", err);
      }
    },
    [onMessageArrivedCallback]
  );

  const onConnectionLost = useCallback(
    (resObj) => {
      console.warn("🔌 MQTT connection lost:", resObj?.errorMessage);
      setIsConnected(false);
      setSubscribedTopics([]);
      connectionAttemptRef.current = false; // ✅ Reset on connection loss

      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (onConnectionLostCallback) onConnectionLostCallback(resObj);
    },
    [onConnectionLostCallback]
  );

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

      // Clean up existing client
      if (clientRef.current) {
        try {
          clientRef.current.disconnect();
        } catch (e) {
          console.warn("Error disconnecting previous client:", e);
        }
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
