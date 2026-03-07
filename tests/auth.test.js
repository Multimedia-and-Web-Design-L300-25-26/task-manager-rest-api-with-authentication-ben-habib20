import request from "supertest";
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "./setup.js";
import User from "../src/models/User.js";

// Mock User methods directly
User.findOne = jest.fn();
User.create = jest.fn();

let token;

beforeAll(() => {
  // Set up dummy JWT secret since we don't have .env loaded for tests by default
  process.env.JWT_SECRET = "supersecret";
});

describe("Auth Routes", () => {
  it("should register a user", async () => {
    // Mock user creation
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      id: "123",
      name: "Test User",
      email: "test@example.com",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.com");
  });

  it("should login user and return token", async () => {
    // Mock user login
    User.findOne.mockResolvedValue({
      id: "123",
      name: "Test User",
      email: "test@example.com",
      matchPassword: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });
});