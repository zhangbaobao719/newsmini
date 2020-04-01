// pages/movies/more-movie/more-movie.js
var util = require('../../../utils/util.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        movies: {},
        navigateTitle: "",
        totalCount: 0,
        requestUrl: "",
        isEmpty: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var category = options.category;
        this.data.navigateTitle = category;
        var dataUrl = "";
        switch (category) {
            case "正在热映":
                dataUrl = app.globalData.doubanBase + '/v2/movie/in_theaters';
                break;
            case "即将上映":
                dataUrl = app.globalData.doubanBase + '/v2/movie/coming_soon';
                break;
            case "豆瓣TOP250":
                dataUrl = app.globalData.doubanBase + '/v2/movie/top250';
                break;
        }
        this.data.requestUrl = dataUrl;
        util.http(dataUrl, this.processDoubanData);
    },
    onScrollLower: function(e) {
        var nextUrl = this.data.requestUrl + "?start=" + this.data.totalCount + "&count=20";
        util.http(nextUrl, this.processDoubanData);
        wx.showNavigationBarLoading()
    },
    onPullDownRefresh: function(event) {
        var refreshUrl = this.data.requestUrl +
            "?start=0&count=20";
        this.data.movies = {};
        this.data.isEmpty = true;
        this.data.totalCount = 0;
        util.http(refreshUrl, this.processDoubanData);
    },
    onMovieTap: function (e) {
        var movieId = e.currentTarget.dataset.movieid;
        wx.navigateTo({
            url: "../movie-detail/movie-detail?id=" + movieId
        })
    },
    processDoubanData: function(data) {
        var movies = [];
        for (var idx in data.subjects) {
            var subject = data.subjects[idx];
            var title = subject.title;
            if (title.length >= 6) {
                title = title.substring(0, 6) + '...';
            }
            // [1,1,1,1,1]   [1,1,1,0,0]
            var temp = {
                stars: util.convertToStarsArray(subject.rating.stars),
                title: title,
                average: subject.rating.average,
                coverageUrl: subject.images.large,
                movieId: subject.id
            }
            movies.push(temp);
        }
        // 
        var totalMovies = {};
        // 如果要绑定新加载的数据，那么需要与旧数据合并在一起
        if (!this.data.isEmpty) {
            totalMovies = this.data.movies.concat(movies);
        } else {
            totalMovies = movies;
            this.data.isEmpty = false;
        }
        this.setData({
            movies: totalMovies
        });
        this.data.totalCount += 20;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
    },
    onReady: function(e) {
        wx.setNavigationBarTitle({
            title: this.data.navigateTitle
        })
    },
})