class HomeController < ApplicationController
  def index
	user = User.new
	user.name = "ming"
	user.save
	render :text => "ming"
  end

  def show
  end

end
