// pages/index/index-detail/index-detail.js
var postsData = require('../../../data/posts-data.js');
var WxParse = require('../../../wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlayingMusic: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var postId = options.id;
    this.data.currentPostId = postId;
    var postData = postsData.postList[postId];
    // 如果在onLoad方法中，不是异步的去执行一个数据绑定
    // 则不需要使用this.setData方法，只需要对this.data赋值即可实现数据绑定
    // this.data.postData = postData;
    var postDataDatial = postData.detail;
    // console.log(postDataDatial)
    WxParse.wxParse('detail', 'html', postDataDatial, that, 5);
    this.setData({
      postData: postData
    })

    var postsCollected = wx.getStorageSync('posts_collected');
    if (postsCollected) {
      var postCollected = postsCollected[postId];
      console.log(postId)
      console.log(postCollected)
      this.setData({
        collected: postCollected
      })
    } else {
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_collected', postsCollected)
    }
    // 重新打开页面 判断音乐是否播放
    if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId === postId) {
      this.setData({
        isPlayingMusic: true
      })
    }
    this.setMusicMonitor();

  },
  setMusicMonitor: function() { // 监听音乐
    var BackgroundAudioManager = wx.getBackgroundAudioManager();
    // 播放音乐
    BackgroundAudioManager.onPlay(() => {
      this.setData({
        isPlayingMusic: true
      })
      app.globalData.g_isPlayingMusic = true;
      app.globalData.g_currentMusicPostId = this.data.currentPostId;
    })
    // 暂停音乐
    BackgroundAudioManager.onPause(() => {
      this.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentMusicPostId = null;
    })
    BackgroundAudioManager.onStop(() => {
      this.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentMusicPostId = null;
    })

  },
  onColletionTap: function(e) {
    this.getPostsCollectedSyc();
    // this.getPostsCollectedAsy();  
  },
  getPostsCollectedAsy: function() { // 异步缓存
    var that = this;
    wx.getStorage({
      key: "posts_collected",
      success: function(res) {
        var postsCollected = res.data;
        // 获取当前内容的收藏缓存值
        var postCollected = postsCollected[that.data.currentPostId];
        // 收藏变成为收藏，为收藏变成收藏
        postCollected = !postCollected;
        // 更新缓存值
        postsCollected[that.data.currentPostId] = postCollected;
        // this.showModal(postsCollected, postCollected);
        that.showToast(postsCollected, postCollected);
      }
    })
  },
  getPostsCollectedSyc: function(e) { //  同步的方法
    // 获取所有缓存值
    var postsCollected = wx.getStorageSync('posts_collected');
    // 获取当前内容的收藏缓存值
    var postCollected = postsCollected[this.data.currentPostId];
    // 收藏变成为收藏，为收藏变成收藏
    postCollected = !postCollected;
    // 更新缓存值
    postsCollected[this.data.currentPostId] = postCollected;
    // this.showModal(postsCollected, postCollected);
    this.showToast(postsCollected, postCollected);
  },
  showModal: function(postsCollected, postCollected) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: postCollected ? '收藏该文章？' : '取消收藏该文章？',
      cancelText: '取消',
      cancelColor: '#92bbb3',
      confirmText: '确认',
      confirmColor: '#93948a',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确认');
          // 更新文章是否缓存值
          wx.setStorageSync('posts_collected', postsCollected);
          // 更新数据绑定，从而实现切换图片
          that.showToast(postsCollected, postCollected);
          that.setData({
            collected: postCollected
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  showToast: function(postsCollected, postCollected) {
    // 更新文章是否缓存值
    wx.setStorageSync('posts_collected', postsCollected);
    // 更新数据绑定，从而实现切换图片
    this.setData({
      collected: postCollected
    })
    wx.showToast({
      title: postCollected ? "收藏成功" : "取消成功",
      icon: 'success',
      duration: 1000
    })
  },
  onShareTap: function(e) {
    var itemList = ['分享给微信好友', '分享到朋友圈', '分享到QQ', '分享到微博'];
    wx.showActionSheet({
      itemList: itemList,
      itemColor: '#000',
      success(res) {
        wx.showModal({
          title: '用户' + itemList[res.tapIndex],
          content: '用户是否取消?' + res.cancel + '现在无法实现分享功能',
        })
      },
      fail(res) {
        wx.showModal({
          title: '用户' + itemList[res.tapIndex],
          content: '用户是否取消?' + res.errMsg + '现在无法实现分享功能',
        })
      }
    })
  },
  onMusicTap: function(e) { // 音乐
    var isPlayingMusic = this.data.isPlayingMusic;
    var currentPostId = this.data.currentPostId;
    var postData = postsData.postList[currentPostId];
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      })
    } else {
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.coverImg
      })
      this.setData({
        isPlayingMusic: true
      })
    }
  }
})