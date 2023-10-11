import express, { Request, Response } from "express";
import axios from "axios";
import { Redis } from "ioredis";

const app = express();
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

const MOCK_API = "https://jsonplaceholder.typicode.com/users/";

app.get("/user/:email", async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    redis.get(email, async (error, response) => {
      if (response) {
        return res.status(200).json({ user: JSON.parse(response) });
      } else {
        const response = await axios.get(`${MOCK_API}?email=${email}`);
        const user = response.data;
        console.log("user successfully retrieved from API");
        redis.set(email, JSON.stringify(user), "EX", 3600);
        return res.status(200).json({ user: user });
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error: error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
