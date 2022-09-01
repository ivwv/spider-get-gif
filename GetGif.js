const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs");
const path = require("path");

class GetGif {
  constructor(from = 257, to = 500) {
    // 动图的起始页
    this.from = from;
    // 动图的结束页
    this.to = to;
    // 动图页 p
    this.page = from;
    // 动图单页内动图的跳转地址
    this.onePageGifHref = [];
    // // 动图单页内动图的下载地址
    // this.gifUrl = [];
    this.init();
  }
  async init() {
    const lazySrc = await this.getOnePageGifHref();
    // console.log(lazySrc);
    this.downloadGif(lazySrc);
  }

  /**
   * 获取动图单页内动图的地址
   * @returns {Promise<void>}
   */
  async getOnePageGifHref() {
    const lazySrc = [];
    const { data: res } = await axios.get(
      `https://www.soogif.com/gif/505350-${this.page}-0-0.html`,
      {
        // 请求头
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          "sec-ch-ua":
            '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
      }
    );
    const $ = cheerio.load(res);
    // 获取 .lazy 的 src 属性
    $(".lazy").each((i, e) => {
      if ($(e).attr("src") != undefined) {
        lazySrc.push($(e).attr("src"));
      }
    });
    // console.log(lazySrc);
    // console.log(lazySrc.length);
    return lazySrc;
  }

  /**
   * 通过url 下载图片
   * @param Array<lazySrc>
   */
  async downloadGif(lazySrc) {
    for (let i = 0; i < lazySrc.length; i++) {
      const filename = lazySrc[i].split("/")[lazySrc[i].split("/").length - 1];

      const { data: res } = await axios.get(lazySrc[i], {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
          "cache-control": "max-age=0",
          "sec-ch-ua":
            '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
        responseType: "stream",
      });
      res.pipe(
        fs.createWriteStream(path.resolve(__dirname, `./imgs/${filename}`))
      );
      // 判断当前是否下载完毕
      if (i === lazySrc.length - 1) {
        console.log(`第${this.page}页下载完毕`);
        // 判断是否还有下一页
        if (this.page < this.to) {
          this.page++;
          this.init();
        } else {
          console.log("下载完毕");
        }
      }
    }
  }
}

// 导出模块
module.exports = GetGif;
