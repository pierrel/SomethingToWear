require 'rubygems'
require 'rest_client'
require 'cgi'
 
 
couchdb_url = "http://127.0.0.1:5984/"
login_url = "_session"
 
url = couchdb_url + login_url

puts "posting to '" + url + "'"
puts RestClient.post(url, :username => 'user-bombay', :password => 'bombay')

# For getting info:
# curl -vX GET http://127.0.0.1:5984/wear/09616823c6d2db0ec9cfd0c06dd74003 -H "Cookie: AuthSession=dXNlci1ib21iYXk6NEFFRjhFOEU6MLS1wrXD5M_lauM0uOPGmULldOg" -H "X-CouchDB-WWW-Authenticate: Cookie" -H "Content-Type: application/x-www-form-urlencoded"
# * About to connect() to 127.0.0.1 port 5984 (#0)
# *   Trying 127.0.0.1... connected
# * Connected to 127.0.0.1 (127.0.0.1) port 5984 (#0)
# > GET /wear/09616823c6d2db0ec9cfd0c06dd74003 HTTP/1.1
# > User-Agent: curl/7.19.6 (i386-apple-darwin10.0.0) libcurl/7.19.6 zlib/1.2.3
# > Host: 127.0.0.1:5984
# > Accept: */*
# > Cookie: AuthSession=dXNlci1ib21iYXk6NEFFRjhFOEU6MLS1wrXD5M_lauM0uOPGmULldOg
# > X-CouchDB-WWW-Authenticate: Cookie
# > Content-Type: application/x-www-form-urlencoded
# > 
# < HTTP/1.1 200 OK
# < Server: CouchDB/0.11.0a (Erlang OTP/R13B)
# < Etag: "3-d600c81eb913e40ce324dd269470e7c7"
# < Date: Tue, 03 Nov 2009 02:55:36 GMT
# < Content-Type: text/plain;charset=utf-8
# < Content-Length: 304
# < Cache-Control: must-revalidate
# < 
# {"_id":"09616823c6d2db0ec9cfd0c06dd74003","_rev":"3-d600c81eb913e40ce324dd269470e7c7","doc_type":"piece","colors":["gray"],"styles":["baggy","tapered"],"pattern":"","material":"cotton","name":"","type":"Pants","_attachments":{"image":{"stub":true,"content_type":"image/jpeg","length":54704,"revpos":2}}}
# * Connection #0 to host 127.0.0.1 left intact
# * Closing connection #0

# For whoami:
# curl -vX GET http://127.0.0.1:5984/_session -H "Cookie: AuthSession=dXNlci1ib21iYXk6NEFFRjhFOEU6MLS1wrXD5M_lauM0uOPGmULldOg" -H "X-CouchDB-WWW-Authenticate: Cookie" -H "Content-Type: application/x-www-form-urlencoded"
# * About to connect() to 127.0.0.1 port 5984 (#0)
# *   Trying 127.0.0.1... connected
# * Connected to 127.0.0.1 (127.0.0.1) port 5984 (#0)
# > GET /_session HTTP/1.1
# > User-Agent: curl/7.19.6 (i386-apple-darwin10.0.0) libcurl/7.19.6 zlib/1.2.3
# > Host: 127.0.0.1:5984
# > Accept: */*
# > Cookie: AuthSession=dXNlci1ib21iYXk6NEFFRjhFOEU6MLS1wrXD5M_lauM0uOPGmULldOg
# > X-CouchDB-WWW-Authenticate: Cookie
# > Content-Type: application/x-www-form-urlencoded
# > 
# < HTTP/1.1 200 OK
# < Server: CouchDB/0.11.0a (Erlang OTP/R13B)
# < Date: Tue, 03 Nov 2009 02:57:37 GMT
# < Content-Type: text/plain;charset=utf-8
# < Content-Length: 43
# < Cache-Control: must-revalidate
# < 
# {"ok":true,"name":null,"roles":["_admin"]}
# * Connection #0 to host 127.0.0.1 left intact
# * Closing connection #0