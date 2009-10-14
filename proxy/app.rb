require 'rubygems'
require 'sinatra'
require 'rest_client'

post '/attach_file' do
  RestClient.put 'http://localhost:5984/wear/' + params[:id] + '/image?rev=' + params[:revision], params[:image][:tempfile].read(), :content_type => 'image/jpeg'
end
