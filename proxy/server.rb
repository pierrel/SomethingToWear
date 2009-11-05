require 'rubygems'
require 'sinatra'
require 'rest_client'
require 'json'

set :port, 8080

post '/attach_file' do
  
  urls = nil
  File.open("urls.json") { |f| urls = JSON.parse(f.read)}
  
  RestClient.put(urls[:couchdb] + "/" + params[:id] + '/image?rev=' + params[:revision], 
                 params[:image][:tempfile].read(), 
                 :content_type => params[:image][:type])
end