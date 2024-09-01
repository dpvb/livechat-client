"use client";

import { socket } from "@/lib/socket";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  function generateRandomUser() {
    const randomUser = Math.floor(Math.random() * 1000);
    return `brownie${randomUser}`;
  }

  useEffect(() => {
    setUsername(generateRandomUser());
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      socket.emit("message", "this is a test!");
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function handleMessage(message: string) {
      console.log(message);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", handleMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", handleMessage);
    };
  }, []);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    const payload = {
      username,
      message,
    };
    socket.emit("message", payload);
  }

  return (
    <main>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      <p>Transport: {transport}</p>
      <p>Username: {username}</p>

      <div>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            className="text-black"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </main>
  );
}
