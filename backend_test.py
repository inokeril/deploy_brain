#!/usr/bin/env python3
"""
Backend API Testing for Brain Training Platform
Testing the Spot Difference Game API
"""

import requests
import json
import base64
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://code-import-13.preview.emergentagent.com"
SESSION_TOKEN = "test_session_1768382576683"

def test_auth():
    """Test authentication with session token"""
    print("🔐 Testing authentication...")
    
    headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers, timeout=10)
        print(f"Auth response status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Authentication successful")
            print(f"User ID: {user_data.get('user_id')}")
            print(f"User Name: {user_data.get('name')}")
            return True
        else:
            print(f"❌ Authentication failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Auth request failed: {e}")
        return False

def test_spot_difference_start():
    """Test starting a spot difference game"""
    print("\n🎮 Testing spot difference game start...")
    
    headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test with easy difficulty
    payload = {
        "difficulty": "easy"
    }
    
    try:
        print("Sending request to start game...")
        response = requests.post(
            f"{BACKEND_URL}/api/spot-difference/start", 
            headers=headers, 
            json=payload,
            timeout=60  # Increased timeout for image generation
        )
        
        print(f"Start game response status: {response.status_code}")
        
        if response.status_code == 200:
            game_data = response.json()
            print(f"✅ Game started successfully")
            print(f"Game ID: {game_data.get('game_id')}")
            print(f"Difficulty: {game_data.get('difficulty')}")
            print(f"Total differences: {game_data.get('total_differences')}")
            print(f"Found count: {game_data.get('found_count')}")
            
            # Check images
            image1 = game_data.get('image1')
            image2 = game_data.get('image2')
            
            if image1 and image2:
                print(f"✅ Image1 received: {len(image1)} characters")
                print(f"✅ Image2 received: {len(image2)} characters")
                
                # Validate base64 format
                try:
                    base64.b64decode(image1)
                    base64.b64decode(image2)
                    print("✅ Images are valid base64 format")
                except Exception as e:
                    print(f"❌ Invalid base64 format: {e}")
                    
            else:
                print("❌ Images not received or empty")
                
            # Verify expected values
            if game_data.get('total_differences') == 3:
                print("✅ Total differences = 3 (correct for easy mode)")
            else:
                print(f"❌ Expected 3 differences, got {game_data.get('total_differences')}")
                
            return game_data
            
        else:
            print(f"❌ Game start failed: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - image generation may be taking too long")
        return None
    except Exception as e:
        print(f"❌ Game start request failed: {e}")
        return None

def test_spot_difference_invalid_difficulty():
    """Test starting game with invalid difficulty"""
    print("\n🧪 Testing invalid difficulty...")
    
    headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "difficulty": "invalid"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/spot-difference/start", 
            headers=headers, 
            json=payload,
            timeout=10
        )
        
        print(f"Invalid difficulty response status: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Correctly rejected invalid difficulty")
        else:
            print(f"❌ Expected 400 error, got {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Invalid difficulty test failed: {e}")

def test_spot_difference_without_auth():
    """Test starting game without authentication"""
    print("\n🔒 Testing without authentication...")
    
    payload = {
        "difficulty": "easy"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/spot-difference/start", 
            json=payload,
            timeout=10
        )
        
        print(f"No auth response status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Correctly rejected unauthenticated request")
        else:
            print(f"❌ Expected 401 error, got {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ No auth test failed: {e}")

def check_backend_logs():
    """Check backend logs for any errors"""
    print("\n📋 Checking backend logs...")
    
    try:
        import subprocess
        result = subprocess.run(
            ["tail", "-n", "50", "/var/log/supervisor/backend.err.log"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.stdout:
            print("Backend error logs:")
            print(result.stdout)
        else:
            print("No recent error logs found")
            
        # Also check stdout logs
        result = subprocess.run(
            ["tail", "-n", "50", "/var/log/supervisor/backend.out.log"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.stdout:
            print("\nBackend output logs:")
            print(result.stdout)
            
    except Exception as e:
        print(f"❌ Could not check logs: {e}")

def main():
    """Run all tests"""
    print("🧠 Brain Training Platform - Spot Difference Game API Tests")
    print("=" * 60)
    
    # Test authentication first
    if not test_auth():
        print("❌ Authentication failed - stopping tests")
        return
    
    # Test spot difference game
    game_data = test_spot_difference_start()
    
    # Test error cases
    test_spot_difference_invalid_difficulty()
    test_spot_difference_without_auth()
    
    # Check logs for any errors
    check_backend_logs()
    
    print("\n" + "=" * 60)
    print("🏁 Testing completed")
    
    if game_data:
        print("✅ Main functionality working - game can be started")
    else:
        print("❌ Main functionality failed - game cannot be started")

if __name__ == "__main__":
    main()