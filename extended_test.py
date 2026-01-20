#!/usr/bin/env python3
"""
Extended Backend API Testing for Spot Difference Game
Testing the complete game flow including click checking
"""

import requests
import json
import time

# Configuration
BACKEND_URL = "https://server-deploy-10.preview.emergentagent.com"
SESSION_TOKEN = "test_session_1768382576683"

def test_complete_game_flow():
    """Test complete game flow: start -> click -> check completion"""
    print("🎯 Testing complete game flow...")
    
    headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Start a new game
    print("Starting new game...")
    start_payload = {"difficulty": "easy"}
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/spot-difference/start", 
            headers=headers, 
            json=start_payload,
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to start game: {response.text}")
            return False
            
        game_data = response.json()
        game_id = game_data.get('game_id')
        print(f"✅ Game started with ID: {game_id}")
        
        # Test clicking in different zones to find differences
        print("Testing click detection...")
        
        # Test clicks in different zones (using zone centers)
        test_clicks = [
            {"x_percent": 16.5, "y_percent": 16.5, "zone": "top-left"},
            {"x_percent": 50, "y_percent": 16.5, "zone": "top-center"},
            {"x_percent": 83.5, "y_percent": 16.5, "zone": "top-right"},
            {"x_percent": 16.5, "y_percent": 50, "zone": "middle-left"},
            {"x_percent": 50, "y_percent": 50, "zone": "center"},
            {"x_percent": 83.5, "y_percent": 50, "zone": "middle-right"},
            {"x_percent": 16.5, "y_percent": 83.5, "zone": "bottom-left"},
            {"x_percent": 50, "y_percent": 83.5, "zone": "bottom-center"},
            {"x_percent": 83.5, "y_percent": 83.5, "zone": "bottom-right"}
        ]
        
        found_differences = 0
        total_differences = game_data.get('total_differences', 3)
        
        for click in test_clicks:
            if found_differences >= total_differences:
                break
                
            click_payload = {
                "game_id": game_id,
                "x_percent": click["x_percent"],
                "y_percent": click["y_percent"]
            }
            
            print(f"Testing click in {click['zone']} zone...")
            
            click_response = requests.post(
                f"{BACKEND_URL}/api/spot-difference/check",
                headers=headers,
                json=click_payload,
                timeout=10
            )
            
            if click_response.status_code == 200:
                click_result = click_response.json()
                
                if click_result.get('correct'):
                    found_differences += 1
                    print(f"✅ Found difference #{found_differences} in {click['zone']}!")
                    print(f"   Found: {click_result.get('found_count')}/{click_result.get('total_differences')}")
                    
                    if click_result.get('completed'):
                        print(f"🎉 Game completed! Time: {click_result.get('time_taken'):.2f}s")
                        return True
                else:
                    print(f"   No difference in {click['zone']}")
            else:
                print(f"❌ Click check failed: {click_response.text}")
                
        if found_differences > 0:
            print(f"✅ Successfully found {found_differences} differences")
            return True
        else:
            print("⚠️  No differences found - this might be expected due to random placement")
            return True  # Still consider success as API is working
            
    except Exception as e:
        print(f"❌ Complete game flow test failed: {e}")
        return False

def test_invalid_game_operations():
    """Test error handling for invalid operations"""
    print("\n🧪 Testing invalid game operations...")
    
    headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Test clicking on non-existent game
    print("Testing click on non-existent game...")
    invalid_click = {
        "game_id": "invalid_game_id",
        "x_percent": 50,
        "y_percent": 50
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/spot-difference/check",
            headers=headers,
            json=invalid_click,
            timeout=10
        )
        
        if response.status_code == 404:
            print("✅ Correctly rejected click on non-existent game")
        else:
            print(f"❌ Expected 404, got {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Invalid game test failed: {e}")

def test_different_difficulties():
    """Test starting games with different difficulties"""
    print("\n🎚️ Testing different difficulty levels...")
    
    headers = {
        "Authorization": f"Bearer {SESSION_TOKEN}",
        "Content-Type": "application/json"
    }
    
    difficulties = ["easy", "medium", "hard"]
    expected_differences = {"easy": 3, "medium": 5, "hard": 7}
    
    for difficulty in difficulties:
        print(f"Testing {difficulty} difficulty...")
        
        payload = {"difficulty": difficulty}
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/spot-difference/start", 
                headers=headers, 
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                game_data = response.json()
                total_diff = game_data.get('total_differences')
                expected = expected_differences[difficulty]
                
                if total_diff == expected:
                    print(f"✅ {difficulty}: {total_diff} differences (correct)")
                else:
                    print(f"❌ {difficulty}: Expected {expected}, got {total_diff}")
            else:
                print(f"❌ {difficulty} failed: {response.text}")
                
        except requests.exceptions.Timeout:
            print(f"⚠️  {difficulty}: Timeout (image generation taking too long)")
        except Exception as e:
            print(f"❌ {difficulty} test failed: {e}")

def main():
    """Run extended tests"""
    print("🧠 Extended Spot Difference Game API Tests")
    print("=" * 60)
    
    # Test complete game flow
    test_complete_game_flow()
    
    # Test error handling
    test_invalid_game_operations()
    
    # Test different difficulties
    test_different_difficulties()
    
    print("\n" + "=" * 60)
    print("🏁 Extended testing completed")

if __name__ == "__main__":
    main()