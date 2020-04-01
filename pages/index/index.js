//index.js
//获取应用实例
var postsData = require('../../data/posts-data.js');
const app = getApp()

Page({
  data: {
    
  },
  onLoad: function () {
      this.setData({
          postList: postsData.postList
      });
  },
    onSwiperTap:function(e){
        // target 和 currentTarget区别
        // target：当前点击的组件 。这里指的是image
        // currentTarget：事件捕获的组件。这里指的是swiper
        var postId = e.target.dataset.postid;
        wx.navigateTo({
            url: 'index-detail/index-detail?id=' + postId
        })
    },
    onPostTap:function(e){
        var postId = e.currentTarget.dataset.postid;
        wx.navigateTo({
            url: 'index-detail/index-detail?id=' + postId
        })
    }
})
