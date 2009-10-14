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
		notMyClothes = getNotMyClothes userid
		recommendation = notMyClothes
		
		closestUser = getClosestUser userid
		
		puts "ming"
		puts closestUser
	
		recommendation = getDeltaUserArticles User.find(userid).articles, closestUser.articles

		render :xml => recommendation
	end

	def getDeltaUserArticles myClothes, hisClothes
		notMyClothes = []
		hisClothes.each do |hisArticle|
			userhas = false
			myClothes.each do |myArticle|
				if myArticle == hisArticle
				userhas = true
				end
			end
			if userhas == false
				notMyClothes << hisArticle
			end
		end
		notMyClothes
	end

	def getClosestUser userid
		users = User.all
		userRelation = []
		currentUser = User.find(userid)
		currentArticles = User.find(userid).articles
		users.each do |user|
			articles = user.articles
			#find cross product between articles and currentArticles
			count = 0
			currentArticles.each do |userarticle|
				articles.each do |article|
					if userarticle.id == article.id
						count = count + 1
					end
				end
			end
			puts "count"
			puts count
			userRelation << count	
		end
		#finding max out of userRelation
		maxuser = nil
		maxcount = -1
		users.size.times do |i|
			if (maxcount < userRelation[i]) && (currentUser != users[i])
				maxuser = users[i]
				maxcount = userRelation[i]
			end
		end
		maxuser
	end	
	
	def getNotMyClothes userid
                user = User.find(userid)
                userArticles = user.articles

                articles = Article.all
                notmyarticles = []
                articles.each do |article|
                        userhas = false
                        userArticles.each do |userArticle|
                                if article.id == userArticle.id
                                        userhas = true
                                        break
                                end
                        end
                        if userhas == false
                                notmyarticles << article
                        end
                end
                notmyarticles
	end
end
