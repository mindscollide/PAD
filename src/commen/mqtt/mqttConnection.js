// src/hooks/useMqttClient.js
import { useRef, useState, useCallback } from "react";
import Paho from "paho-mqtt";
import { secureRandomString } from "./utils";
import { stringify } from "postcss";

export const useMqttClient = ({
  onMessageArrivedCallback,
  onConnectionLostCallback,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedTopics, setSubscribedTopics] = useState([]);
  const clientRef = useRef(null);
  const randomString = secureRandomString();
  const userProfileData = JSON.parse(sessionStorage.getItem("user_profile_data"));
      console.log("mqtt",userProfileData)
  let user_name = userProfileData?.firstName + " " + userProfileData?.lastName;

  const subscribeToTopics = useCallback(
    (topics = []) => {
      if (!clientRef.current || !clientRef.current.isConnected()) return;

      topics.forEach((topic) => {
        if (!subscribedTopics.includes(topic)) {
          clientRef.current.subscribe(topic, {
            qos: 0,
            onSuccess: () => {
              console.log(`Subscribed to topic: ${topic}`);
              setSubscribedTopics((prev) =>
                Array.from(new Set([...prev, topic]))
              );
            },
            onFailure: (err) => {
              console.error(`Failed to subscribe: ${topic}`, err?.errorMessage);
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
            console.log(`Unsubscribed from topic: ${topic}`);
            setSubscribedTopics((prev) => prev.filter((t) => t !== topic));
          },
          onFailure: (err) => {
            console.error(`Failed to unsubscribe: ${topic}`, err?.errorMessage);
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
        console.log("MQTT message arrived:", parsed);
        if (onMessageArrivedCallback) onMessageArrivedCallback(parsed);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    },
    [onMessageArrivedCallback]
  );

  const onConnectionLost = useCallback(
    (resObj) => {
      console.warn("MQTT connection lost:", resObj?.errorMessage);
      setIsConnected(false);
      setSubscribedTopics([]);
      if (onConnectionLostCallback) onConnectionLostCallback(resObj);
    },
    [onConnectionLostCallback]
  );

  const connectToMqtt = useCallback(
    ({ subscribeID, userID }) => {
      if (!subscribeID || isConnected) return;

      const mqttPort = JSON.parse(sessionStorage.getItem("user_mqtt_Port"));
      const mqttHost = JSON.parse(
        sessionStorage.getItem("user_mqtt_ip_Address")
      );
      console.log("mqtt",mqttPort)
      console.log("mqtt",mqttHost)
      const newClientID = secureRandomString();
      console.log("mqtt",newClientID)
      console.log("mqtt",user_name)

      clientRef.current = new Paho.Client(
        mqttHost,
        Number(mqttPort),
        newClientID
      );

      clientRef.current.onConnectionLost = onConnectionLost;
      clientRef.current.onMessageArrived = onMessageArrived;

      clientRef.current.connect({
        onSuccess: () => {
          console.log("MQTT connected:", newClientID);
          setIsConnected(true);
          subscribeToTopics([subscribeID]);
        },
        onFailure: (err) => {
          console.error("MQTT connection failed:", err.errorMessage);
          setIsConnected(false);
          setTimeout(() => connectToMqtt({ subscribeID, userID }), 6000);
        },
        keepAliveInterval: 300,
        reconnect: true,
        userName: import.meta.env.VITE_MQTT_USERNAME,
        password: import.meta.env.VITE_MQTT_PASSWORD,
        cleanSession: true,
        useSSL: false,
      });
    },
    [isConnected, onMessageArrived, onConnectionLost, subscribeToTopics]
  );

  return {
    client: clientRef.current,
    isConnected,
    connectToMqtt,
    subscribeToTopics,
    unsubscribeFromTopics,
    onMessageArrived,
    onConnectionLost,
  };
};
