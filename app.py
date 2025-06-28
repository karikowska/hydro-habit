### streamlit UI here

import streamlit as st
import hashlib
import secrets
from datetime import datetime

# Initialize MongoDB connection (replace with your connection string)
@st.cache_resource
def init_connection():
    # Replace with your MongoDB connection string
    # client = MongoClient("mongodb://localhost:27017/")
    # return client.your_database_name
    return None  # Placeholder for demo

def hash_password(password):
    """Simple password hashing for demo purposes"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_login_string():
    """Generate a secure random login string"""
    return secrets.token_urlsafe(32)

def store_user_data(db, username, login_string):
    """Store user data in MongoDB"""
    if db is None:
        # For demo purposes, store in session state
        if 'users' not in st.session_state:
            st.session_state.users = {}
        st.session_state.users[username] = {
            'login_string': login_string,
            'created_at': datetime.now()
        }
        return True
    
    try:
        users_collection = db.users
        user_doc = {
            'username': username,
            'login_string': login_string,
            'created_at': datetime.now()
        }
        users_collection.insert_one(user_doc)
        return True
    except Exception as e:
        st.error(f"Error storing user data: {e}")
        return False

def validate_login(db, username, login_string):
    """Validate user login against database"""
    if db is None:
        # For demo purposes, check session state
        if 'users' not in st.session_state:
            return False
        return st.session_state.users.get(username, {}).get('login_string') == login_string
    
    try:
        users_collection = db.users
        user = users_collection.find_one({'username': username, 'login_string': login_string})
        return user is not None
    except Exception as e:
        st.error(f"Error validating login: {e}")
        return False

def log_sip(db, username):
    """Log a sip to the database"""
    if db is None:
        # For demo purposes, store in session state
        if 'sips' not in st.session_state:
            st.session_state.sips = []
        st.session_state.sips.append({
            'username': username,
            'timestamp': datetime.now(),
            'amount_ml': 250  # Standard glass of water
        })
        return True
    
    try:
        sips_collection = db.sips
        sip_doc = {
            'username': username,
            'timestamp': datetime.now(),
            'amount_ml': 250,
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        sips_collection.insert_one(sip_doc)
        return True
    except Exception as e:
        st.error(f"Error logging sip: {e}")
        return False

def get_daily_sips(db, username):
    """Get today's sip count for the user"""
    if db is None:
        # For demo purposes, count from session state
        if 'sips' not in st.session_state:
            return 0
        today = datetime.now().strftime('%Y-%m-%d')
        return len([sip for sip in st.session_state.sips 
                   if sip['username'] == username and 
                   sip['timestamp'].strftime('%Y-%m-%d') == today])
    
    try:
        sips_collection = db.sips
        today = datetime.now().strftime('%Y-%m-%d')
        count = sips_collection.count_documents({
            'username': username,
            'date': today
        })
        return count
    except Exception as e:
        st.error(f"Error getting sip count: {e}")
        return 0

def main_page():
    """Water tracking main page"""
    
    # Get current sip count
    daily_sips = get_daily_sips(init_connection(), st.session_state.username)
    daily_ml = daily_sips * 250
    
    # Center the glass and button
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        # Display water glass (using emoji for simplicity)
        st.markdown("""
        <div style="text-align: center; font-size: 120px; margin: 40px 0;">
            🥤
        </div>
        """, unsafe_allow_html=True)
        
        # Sip button
        if st.button("💧 SIP!", use_container_width=True, type="primary"):
            if log_sip(init_connection(), st.session_state.username):
                st.balloons()
                st.success("Nice sip! 💪")
                st.rerun()
    
    # Daily progress
    st.markdown("---")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Today's Sips", daily_sips)
    
    with col2:
        st.metric("Water Intake", f"{daily_ml} ml")
    
    with col3:
        goal_ml = 2000  # 8 glasses * 250ml
        progress = min(daily_ml / goal_ml, 1.0)
        st.metric("Daily Goal", f"{progress:.0%}")
    
    # Progress bar
    st.progress(progress, text=f"Daily Goal Progress: {daily_ml}/{goal_ml} ml")
    
    # Logout button in sidebar
    with st.sidebar:
        st.write(f"👋 Hello, {st.session_state.username}!")
        if st.button("Logout"):
            for key in ['authenticated', 'username', 'login_string']:
                if key in st.session_state:
                    del st.session_state[key]
            st.rerun()

def main():
    st.set_page_config(page_title="HydroHabit", page_icon="💧")
    
    db = init_connection()
    
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    
    if st.session_state.authenticated:
        main_page()
        return
    
    st.title("💧HydroHabit💧")
    st.write("Welcome to HydroHabit! The only app where more water equals less effort!")
    
    user_type = st.radio(
        "Are you a new user or returning user?",
        ["New User (I need a login string)", "Returning User (I have a login string)"]
    )
    
    if user_type == "New User (I need a login string)":
        st.header("📝 New User Registration")
        st.write("Enter your username to get started!")
        
        with st.form("new_user_form"):
            username = st.text_input("Username", placeholder="Enter your username")
            submitted = st.form_submit_button("Get My Login String!")
            
            if submitted:
                if username:
                    login_string = generate_login_string()
                    
                    # Store in database
                    if store_user_data(db, username, login_string):
                        st.success("✅ User data stored successfully!")
                        
                        # Display login string
                        st.subheader("🎫 Your Login String")
                        st.code(login_string, language=None)
                        st.warning("⚠️ Save this login string! You'll need it to access your account.")
                        accept = st.form_submit_button("I've noted it down!")
                        if accept:
                            st.rerun()
                    else:
                        st.error("❌ Failed to store user data. Please try again.")
                else:
                    st.error("❌ Please enter a username.")
    
    else:
        st.header("🔑 Returning User Login")
        st.write("Enter your login credentials to access the main page.")
        
        with st.form("login_form"):
            username = st.text_input("Username", placeholder="Enter your username")
            login_string = st.text_input("Login String", placeholder="Enter your login string", type="password")
            submitted = st.form_submit_button("Login")
            
            if submitted:
                if username and login_string:
                    if validate_login(db, username, login_string):
                        st.success("✅ Login successful!")
                        st.session_state.username = username
                        st.session_state.login_string = login_string
                        st.session_state.authenticated = True
                        st.rerun()
                    else:
                        st.error("❌ Invalid username or login string. Please try again.")
                else:
                    st.error("❌ Please enter both username and login string.")
    
    # Demo info
    st.sidebar.header("ℹ️ Demo Information")
    st.sidebar.write("This is a demo implementation of the user flows you provided.")
    st.sidebar.write("**Note:** Replace the MongoDB connection with your actual database.")
    
    if 'users' in st.session_state and st.session_state.users:
        st.sidebar.subheader("Demo Users Created:")
        for username in st.session_state.users.keys():
            st.sidebar.write(f"• {username}")

if __name__ == "__main__":
    main()