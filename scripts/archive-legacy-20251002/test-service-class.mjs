#!/usr/bin/env node

/**
 * Test our SoccersApiService class
 */

import dotenv from 'dotenv';
dotenv.config();

// Mock the browser environment for the service
global.process = {
  ...process,
  env: {
    ...process.env,
    REACT_APP_SOCCERSAPI_KEY: process.env.SOCCERSAPI_KEY,
    REACT_APP_SOCCERSAPI_USERNAME: process.env.SOCCERSAPI_USERNAME
  }
};

// Import the service (we'll need to copy the class code since it's for browser)
class SoccersApiService {
  constructor() {
    this.baseUrl = 'https://api.soccersapi.com/v2.2';
    this.apiKey = process.env.REACT_APP_SOCCERSAPI_KEY || process.env.SOCCERSAPI_KEY || '';
    this.username = process.env.REACT_APP_SOCCERSAPI_USERNAME || process.env.SOCCERSAPI_USERNAME || '';
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.minRequestInterval = 100;

    console.log(`🔑 API Key: ${this.apiKey?.substring(0, 5)}...`);
    console.log(`👤 Username: ${this.username}`);
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error('SoccersAPI key not configured');
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add any additional params
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // SoccersAPI authentication format: user + token + t=list
    if (this.username) {
      url.searchParams.append('user', this.username);
      url.searchParams.append('token', this.apiKey);
      url.searchParams.append('t', 'list');
    } else {
      // Fallback to simple API key if no username
      url.searchParams.append('APIkey', this.apiKey);
    }

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'FixturesApp/1.0',
    };

    try {
      this.lastRequestTime = Date.now();
      this.requestCount++;

      console.log(`📡 Request #${this.requestCount}: ${endpoint}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      console.log(`✅ Success. Requests left: ${data.meta?.requests_left}`);

      return {
        success: true,
        data: data.data || data,
        meta: data.meta
      };

    } catch (error) {
      console.error(`❌ Request failed:`, error);

      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async testConnection() {
    try {
      const response = await this.makeRequest('/leagues');

      if (response.success) {
        console.log('🎉 Connection successful!');
        return true;
      } else {
        console.error('💥 Connection failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('💥 Connection test failed:', error);
      return false;
    }
  }
}

async function test() {
  console.log('🚀 Testing SoccersApiService class...');

  const service = new SoccersApiService();
  const success = await service.testConnection();

  console.log('🎯 Result:', success ? 'SUCCESS' : 'FAILED');
}

test();