# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_RecommenderRails_session',
  :secret      => 'd5fd3e3d0de5edbb98f6611841d56c1738692da6c586645cb01a041a38743ac1f524b52bb43a5e6086f9ca2f543b21abefb493f4213d2c75bd38c640244991a8'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
