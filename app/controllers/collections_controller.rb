class CollectionsController < ApplicationController
	def index
		userid = params[:user]
		articleid = params[:article]
		@user = User.find(userid)
		@article = Article.find(articleid)
		@return = "already added"
		#doing some many to many relationships
		articles = @user.articles
		articles.each do |article|
			if article.id == @article.id
				return
			end
		end
		articles << @article		

		@return = "created new relationship"
	end


	def getclothes
		userid = params[:user]
		render :xml => User.find(userid).articles		
	end

	def getrecommendation
		userid = params[:user]
		user = User.find(userid)
		userArticles = user.articles
		
		articles = Article.all
		articles.each do |article|
			userArticles.each do |userArticle|
				if article.id == userArticle.id
					articles.delete(article)
					break
				end
			end
		end 		
		render :xml => articles	
	end	

end
