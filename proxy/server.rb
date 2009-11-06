require 'rubygems'
require 'sinatra'
require 'rest_client'
require 'json'

set :public, "sammy"
set :port, 8080

urls = nil
File.open("sammy/urls.json") { |f| urls = JSON.parse(f.read)}

db = urls['couchdb_host'] + '/' + urls['couchdb']

post '/attach_file' do
  
  RestClient.put(urls['coucbdb_host'] + "/" + urls['couchdb'] + "/" + params[:id] + '/image?rev=' + params[:revision], 
                 params[:image][:tempfile].read(), 
                 :content_type => params[:image][:type])
end

get '/' do
  redirect '/index.html'
end

get %r{/db/(.*)} do
  
  document = params[:captures].first
  
  redirect db + '/' + document
end

post %r{/db/(.*)} do 
  'hello'
  #redirect urls['couchdb_host'] + '/' + params[:captures].first
end