"use client";

import { socket } from "@/lib/socket";
import { Payload } from "@/types/types";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Payload[]>([]);

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
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function handleMessage(payload: Payload) {
      console.log(payload);
      setMessages((prevMessages) => [...prevMessages, payload]);
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
    setMessage("");
  }

  return (
    <div className="h-screen py-4">
      <div className="flex flex-col w-1/3 mx-auto border-[1px] border-neutral-800 rounded-md h-full py-1">
        <div className="flex justify-between border-b-[1px] border-neutral-800 text-lg mb-2">
          <p className="font-bold text-center w-full text-neutral-300 py-2">
            LIVE CHAT
          </p>
        </div>
        <div className="flex flex-col text-sm overflow-y-auto overflow-x-hidden h-full pl-2 pr-4">
          {messages.map((payload, index) => (
            <div key={index}>
              <span className="text-red-500">{payload.username} </span>
              <span>{payload.message}</span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2 py-2 px-2">
          <input
            type="text"
            className="rounded-md bg-neutral-800 text-neutral-500 outline-none p-1 flex-grow placeholder-neutral-500"
            value={message}
            placeholder="Send a message..."
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="bg-red-500 min-w-fit p-1 rounded-md">
            Send
          </button>
        </form>{" "}
      </div>
    </div>
  );
}
