// pages/movies/movies.js
var util = require('../../utils/util.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        inTheaters: {},
        comingSoon: {},
        top250Url: {},
        searchResult: {},
        containerShow: true,
        searchPanelShow: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var inTheatersUrl = app.globalData.doubanBase + '/v2/movie/in_theaters' + "?start=0&count=3";
        var comingSoonUrl = app.globalData.doubanBase + '/v2/movie/coming_soon' + "?start=0&count=3";
        var top250Url = app.globalData.doubanBase + '/v2/movie/top250' + "?start=0&count=3";
        this.getMovieListData(inTheatersUrl, "inTheaters", "正在热映");
        this.getMovieListData(comingSoonUrl, "comingSoon", "即将上映");
        this.getMovieListData(top250Url, "top250", "豆瓣TOP250");
    },
    getMovieListData: function(url, settedKey, categoryTitle) {
        var that = this;
        wx.request({
            url: url,
            method: 'GET',
            header: {
                'content-type': 'json' // 默认值
            },
            success(res) {
                that.processDoubanData(res.data, settedKey, categoryTitle);
            },
            fail(error) {
                console.log(error)
            }
        })
    },
    onMoreTap: function(e) {
        var category = e.currentTarget.dataset.category;
        wx.navigateTo({
            url: 'more-movie/more-movie?category=' + category,
        })
    },
    onBindFocus: function(e) {
        this.setData({
            containerShow: false,
            searchPanelShow: true
        })
    },
    onCancelImgTap: function(e) {
        this.setData({
            containerShow: true,
            searchPanelShow: false,
            // searchResult: {}
        })
    },
    onBindBlur: function(e) {
        var text = e.detail.value;
        console.log(text);
        var searchUrl = app.globalData.doubanBase + "/v2/movie/search?q=" + text;
        console.log(searchUrl);
        this.getMovieListData(searchUrl, "searchResult", "");
    },
    onMovieTap:function(e){
        var movieId = e.currentTarget.dataset.movieid;
        wx.navigateTo({
            url: "movie-detail/movie-detail?id=" + movieId
        })
    },
    processDoubanData: function(moviesDouban, settedKey, categoryTitle) {
        var movies = [];
        for (var idx in moviesDouban.subjects) {
            var subject = moviesDouban.subjects[idx];
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
        var readyData = {};
        readyData[settedKey] = {
            categoryTitle: categoryTitle,
            movies: movies
        };
        this.setData(readyData);
    }
})