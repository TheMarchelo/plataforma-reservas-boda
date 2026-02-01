
import requests
import json

BASE_URL = "http://localhost:8000"

def verify_sync():
    print("1. Fetching guests...")
    guests = requests.get(f"{BASE_URL}/guests/").json()
    if not guests:
        print("No guests found.")
        return

    # Find a guest to test with
    target_guest = None
    for g in guests:
        if g.get("nombre_completo", "").lower().startswith("fulgencio"):
            target_guest = g
            break
    
    if not target_guest:
        target_guest = guests[0]

    guest_id = target_guest["id"]
    original_name = target_guest["nombre_completo"]
    print(f"Testing with guest: {original_name} (ID: {guest_id})")

    # 2. Assign a seat to this guest if not already assigned
    print("2. Checking assignments...")
    seats = requests.get(f"{BASE_URL}/seats/").json()
    assigned_seat = next((s for s in seats if s["assigned_guest_id"] == guest_id), None)

    if not assigned_seat:
        # Assign a free seat
        free_seat = next((s for s in seats if s["status"] == "available"), None)
        if not free_seat:
            print("No free seats to test with.")
            return
        
        print(f"Assigning seat {free_seat['id']} to {original_name}...")
        requests.put(f"{BASE_URL}/seats/{free_seat['id']}/reserve?guest_id={guest_id}")
        assigned_seat_id = free_seat['id']
    else:
        assigned_seat_id = assigned_seat["id"]
        print(f"Guest already has seat: {assigned_seat_id}")

    # 3. Update guest name
    new_name = original_name + " MODIFIED"
    print(f"3. Updating guest name to: {new_name}")
    
    # Construct update payload (assuming GuestCreate model structure)
    payload = target_guest.copy()
    payload["nombre_completo"] = new_name
    # Remove 'id' if it's in the payload because Pydantic might not expect it in response_model vs create model
    if 'id' in payload: del payload['id']

    resp = requests.put(f"{BASE_URL}/guests/{guest_id}", json=payload)
    if resp.status_code != 200:
        print(f"Failed to update guest: {resp.text}")
        return

    # 4. Verify seat has new name
    print("4. Verifying seat update...")
    seats_after = requests.get(f"{BASE_URL}/seats/").json()
    target_seat = next((s for s in seats_after if s["id"] == assigned_seat_id), None)
    
    if target_seat and target_seat["assigned_guest_name"] == new_name:
        print("SUCCESS! Seat name was updated.")
    else:
        print(f"FAILURE! Seat name is: {target_seat.get('assigned_guest_name')} (expected {new_name})")

    # 5. Revert change
    print("5. Reverting name change...")
    payload["nombre_completo"] = original_name
    requests.put(f"{BASE_URL}/guests/{guest_id}", json=payload)
    print("Reverted.")

if __name__ == "__main__":
    verify_sync()
