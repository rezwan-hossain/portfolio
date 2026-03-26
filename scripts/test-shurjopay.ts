// scripts/test-shurjopay.ts
import axios, { AxiosError } from "axios";

interface ShurjoPayResponse {
  token?: string;
  [key: string]: any;
}

async function test() {
  const configs = [
    {
      label: "Engine API",
      url: "https://engine.shurjopayment.com",
      username: "sp_sandbox",
      password: "pyaborern",
    },
    {
      label: "Sandbox API",
      url: "https://sandbox.shurjopayment.com",
      username: "sp_sandbox",
      password: "pyaborern",
    },
    {
      label: "Engine with /api",
      url: "https://engine.shurjopayment.com/api",
      username: "sp_sandbox",
      password: "pyaborern",
    },
    {
      label: "given by ShurjoPay support",
      url: "https://sandbox.shurjopayment.com/api",
      username: "sp_sandbox",
      password: "pyyk97hu&6u6",
    },
  ];

  for (const config of configs) {
    console.log(`\n--- Testing: ${config.label} ---`);
    console.log(`URL: ${config.url}`);

    // 🔹 Test with /api/get_token
    try {
      const res = await axios.post<ShurjoPayResponse>(
        `${config.url}/api/get_token`,
        {
          username: config.username,
          password: config.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        },
      );

      console.log("✅ /api/get_token Status:", res.status);
      console.log("Token:", res.data.token ? "✅ GOT IT" : "❌ missing");
      console.log("Response:", JSON.stringify(res.data, null, 2));

      if (res.data.token) {
        console.log("\n🎉 WORKING CONFIG FOUND!");
        console.log(`URL: ${config.url}`);
        console.log(`Username: ${config.username}`);
        return;
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(
          "❌ /api/get_token failed:",
          err.response?.status || err.message,
        );
      } else {
        console.log("❌ Unknown error:", err);
      }
    }

    // 🔹 Test with /get_token
    try {
      const res = await axios.post<ShurjoPayResponse>(
        `${config.url}/get_token`,
        {
          username: config.username,
          password: config.password,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        },
      );

      console.log("✅ /get_token Status:", res.status);
      console.log("Token:", res.data.token ? "✅ GOT IT" : "❌ missing");

      if (res.data.token) {
        console.log("\n🎉 WORKING CONFIG FOUND!");
        console.log(`URL: ${config.url}`);
        return;
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(
          "❌ /get_token failed:",
          err.response?.status || err.message,
        );
      } else {
        console.log("❌ Unknown error:", err);
      }
    }
  }

  console.log("\n❌ No working configuration found.");
}

test();
