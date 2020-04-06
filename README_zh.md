# Grafana Calc Query Datasource

---


基于Grafana Datasource实现，主要解决问题：对多个查询结果进行四则运算

# 下一步计划   
- 增加基本金融库的计算分析

# 截图

![Screenshot1](/img/img1.png)


# 安装

```shell
cd /var/lib/grafana/plugins
sudo git clone https://github.com/rayleeafar/grafana-Calc-queries
sudo service grafana-server restart
```

# 用法

- 创建 grafana-calc-queries 类型的数据源。
- 填写一个计算公式，计算出图

# 致谢

- [grafana](https://github.com/grafana/grafana)
- [simple-json-datasource](https://github.com/grafana/simple-json-datasource)
- [grafana-meta-queries](https://github.com/GoshPosh/grafana-meta-queries)
- [grafana-compare-queries](https://github.com/AutohomeCorp/grafana-compare-queries)

Made by ray@og