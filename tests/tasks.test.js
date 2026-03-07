import request from "supertest";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import app from "./setup.js";
import User from "../src/models/User.js";
import Task from "../src/models/Task.js";
import jwt from "jsonwebtoken";

// Mock methods directly
User.findById = jest.fn();
Task.find = jest.fn();

let token;
let taskId;

beforeAll(async () => {
  process.env.JWT_SECRET = "supersecret";
  token = jwt.sign({ id: "123" }, process.env.JWT_SECRET, { expiresIn: "30d" });

  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: "123", name: "Task User" }),
  });
});

describe("Task Routes", () => {
  it("should not allow access without token", async () => {
    const res = await request(app).get("/api/tasks");

    expect(res.statusCode).toBe(401);
  });

  it("should create a task", async () => {
    Task.prototype.save = jest.fn().mockResolvedValue({
      _id: "task1",
      title: "Test Task",
      description: "Testing",
    });

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");

    taskId = res.body._id;
  });

  it("should get user tasks only", async () => {
    Task.find.mockResolvedValue([
      { title: "Task 1", owner: "123" },
      { title: "Task 2", owner: "123" },
    ]);

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});