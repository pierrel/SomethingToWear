require 'rubygems'
require 'sinatra'
require 'rest_client'
require 'json'

urls = nil
File.open("../sammy/urls.json") { |f| urls = JSON.parse(f.read)}

post '/attach_file' do
  
  RestClient.put(urls[:couchdb_host] + "/" + urls[:couchdb] + "/" + params[:id] + '/image?rev=' + params[:revision], 
                 params[:image][:tempfile].read(), 
                 :content_type => params[:image][:type])
end

# DOES NOT USE COUCHDB_HOST URL
post '/authenticate' do 
  
  url =  "http://admin:bombay@localhost:5984/_session"
  
  begin
    couch_response = RestClient.post(url, :username => params['username'], :password => params['password'])
  
  rescue RestClient::Unauthorized => e
    puts "Unauthorized attempted to authenticate with '" + url + "'"
    return JSON.generate({'ok' => false})
  else
    puts "response: '" + couch_response + "'"
    puts "headers: '" + JSON.generate(couch_response.headers) + "'"
    our_response = {'ok' => JSON.parse(couch_response)['ok'], 'cookie' => couch_response.headers[:set_cookie].split(';').first}
    return JSON.generate our_response
  end
end

get '/check' do
  'Proxy server works!'
end