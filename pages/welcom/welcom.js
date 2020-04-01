// pages/welcom/welcom.js
Page({
    onTap: function(e){
        // wx.redirectTo({
        //     url: '../index/index',
        // })
        wx.switchTab({
            url: "../index/index"
        });
    }    
})