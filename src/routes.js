/*jslint todo: true, node: true, stupid: true, plusplus: true, continue: true, unparam: true */
"use strict";
var routes = {},
    util = require('util'),
    texts = require('./texts'),
    utils = require('./utils');

routes.root = function (req, res, db) {
  db.Pod.projectStats('diaspora', function (diaspora_stats) {
    db.Pod.projectStats('friendica', function (friendica_stats) {
      db.Pod.projectStats('hubzilla', function (hubzilla_stats) {
        db.Pod.globalCharts(function (chartData) {
          res.render('index.njk', {
            stats: {
              diaspora: diaspora_stats[0],
              friendica: friendica_stats[0],
              hubzilla: hubzilla_stats[0]
            },
            texts: texts.networks,
            globalData: chartData[chartData.length - 1],
            chartData: chartData
          });
        }, function (err) {
            console.log(err);
        });
      });
    });
  });
};

routes.nodesList = function (req, res, db) {
  db.Pod.allForList("", function (nodesList) {
    res.render('nodes-list.njk', {nodesData: nodesList});
  }, function (err) {
      console.log(err);
  });
}

routes.info = function (req, res, db) {
  res.render('about.njk');
}

function processVersionStats(pageData) {
    var versionsStats = {
      stats063: {
        nodes: 0,
        users: 0,
        monthlyUsers: 0
      },
      stats060: {
        nodes: 0,
        users: 0,
        monthlyUsers: 0
      },
      stats050: {
        nodes: 0,
        users: 0,
        monthlyUsers: 0
      }
    };
    for (var i = 0; i < pageData.nodesData.length; i++) {
      var node = pageData.nodesData[i];
      if (node.version.startsWith("0.6.0") || node.version.startsWith("0.6.1") || node.version.startsWith("0.6.2")) {
        versionsStats.stats060.nodes++;
        versionsStats.stats060.users += node.total_users;
        versionsStats.stats060.monthlyUsers += node.active_users_monthly;
      } else if (node.version.startsWith("0.6")) {
        versionsStats.stats063.nodes++;
        versionsStats.stats063.users += node.total_users;
        versionsStats.stats063.monthlyUsers += node.active_users_monthly;
      } else {
        versionsStats.stats050.nodes++;
        versionsStats.stats050.users += node.total_users;
        versionsStats.stats050.monthlyUsers += node.active_users_monthly;
      }
    }

    if (pageData.globalData.nodes > 0) {
      versionsStats.stats063.nodesRatio = Math.round(versionsStats.stats063.nodes / pageData.globalData.nodes * 100);
      versionsStats.stats060.nodesRatio = Math.round(versionsStats.stats060.nodes / pageData.globalData.nodes * 100);
      versionsStats.stats050.nodesRatio = Math.round(versionsStats.stats050.nodes / pageData.globalData.nodes * 100);
    }
    if (pageData.globalData.users > 0) {
      versionsStats.stats063.usersRatio = Math.round(versionsStats.stats063.users / pageData.globalData.users * 100);
      versionsStats.stats060.usersRatio = Math.round(versionsStats.stats060.users / pageData.globalData.users * 100);
      versionsStats.stats050.usersRatio = Math.round(versionsStats.stats050.users / pageData.globalData.users * 100);
    }
    if (pageData.globalData.active_users_monthly > 0) {
      versionsStats.stats063.monthlyUsersRatio = Math.round(versionsStats.stats063.monthlyUsers / pageData.globalData.active_users_monthly * 100);
      versionsStats.stats060.monthlyUsersRatio = Math.round(versionsStats.stats060.monthlyUsers / pageData.globalData.active_users_monthly * 100);
      versionsStats.stats050.monthlyUsersRatio = Math.round(versionsStats.stats050.monthlyUsers / pageData.globalData.active_users_monthly * 100);
    }
    return versionsStats;
}

routes.renderNetwork = function (network, res, db) {
  db.Pod.projectCharts(network, function (chartData) {
    db.Pod.allForList(network, function (nodesList) {
      var pageData = {
        network: network,
        texts: texts.networks[network],
        globalData: chartData[chartData.length - 1],
        chartData: chartData,
        nodesData: nodesList
      };
      pageData.versionStats = processVersionStats(pageData);
      res.render('network-page.njk', pageData);
    }, function (err) {
        console.log(err);
    });
  }, function (err) {
      console.log(err);
  });
}

routes.renderNode = function (req, res, db) {
  var nodeHost = req.params.host;
  db.Pod.nodeInfo(nodeHost, function(nodeInfo) {
    db.Pod.nodeCharts(nodeHost, function(chartData) {
      res.render('node.njk', {
        node: utils.formatNodeInfo(nodeInfo[0]),
        globalData: chartData[chartData.length - 1],
        chartData: chartData
      });
    });
  });
}

/* API routes */
routes.pods = function (req, res, db) {
    db.Pod.allForList("",
        function (pods) {
            res.json({pods: pods});
        },
        function (err, result) {
            if (err) {
                console.log(err);
            }
        }
    );
};

routes.item = function (req, res, db) {
    if (['total_users', 'active_users_halfyear', 'active_users_monthly', 'local_posts', 'local_comments'].indexOf(req.params.item) > -1) {
        db.Pod.allPodStats(req.params.item, function (stats) {
            var json = [],
                podids = {},
                i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    if (stats[i].item) {
                        if (podids[stats[i].pod_id] === undefined) {
                            json.push({
                                name: (stats[i].name.toLowerCase() === 'diaspora*') ? stats[i].host : stats[i].name,
                                data: [],
                                // following tip from http://stackoverflow.com/a/1152508/1489738
                                color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)
                            });
                            podids[stats[i].pod_id] = json.length - 1;
                        }
                        json[podids[stats[i].pod_id]].data.push({x: stats[i].timestamp, y: stats[i].item});
                    }
                }
            }
            res.json(json);
        }, function (err, result) {
            if (err) {
                console.log(err);
            }
        });
    } else if (req.params.item === 'global') {
        db.GlobalStat.getStats(function (stats) {
            var json = [
                {
                    name: "Active users 1 month",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'stack'
                },
                {
                    name: "Active users 6 months",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'stack'
                },
                {
                    name: "Total users",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'stack'
                },
                {
                    name: "Total posts",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                },
                {
                    name: "Total comments",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                },
                {
                    name: "Active pods",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                }
            ], i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    json[0].data.push({x: stats[i].timestamp, y: stats[i].active_users_monthly || 0});
                    json[1].data.push({x: stats[i].timestamp, y: stats[i].active_users_halfyear || 0});
                    json[2].data.push({x: stats[i].timestamp, y: stats[i].total_users || 0});
                    json[3].data.push({x: stats[i].timestamp, y: stats[i].local_posts || 0});
                    json[4].data.push({x: stats[i].timestamp, y: stats[i].local_comments || 0});
                    json[5].data.push({x: stats[i].timestamp, y: stats[i].pod_count || 0});
                }
            }
            res.json(json);
        });
    } else if (req.params.item === 'global_users') {
        db.GlobalStat.getStats(function (stats) {
            var json = [
                {
                    name: "Total users",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                }
            ], i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    json[0].data.push({x: stats[i].timestamp, y: stats[i].total_users || 0});
                }
            }
            res.json(json);
        });
    } else if (req.params.item === 'global_posts') {
        db.GlobalStat.getStats(function (stats) {
            var json = [
                {
                    name: "Total posts",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                }
            ], i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    json[0].data.push({x: stats[i].timestamp, y: stats[i].local_posts || 0});
                }
            }
            res.json(json);
        });
    } else if (req.params.item === 'global_comments') {
        db.GlobalStat.getStats(function (stats) {
            var json = [
                {
                    name: "Total comments",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                }
            ], i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    json[0].data.push({x: stats[i].timestamp, y: stats[i].local_comments || 0});
                }
            }
            res.json(json);
        });
    } else if (req.params.item === 'global_active_month') {
        db.GlobalStat.getStats(function (stats) {
            var json = [
                {
                    name: "Active users 1 month",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                }
            ], i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    json[0].data.push({x: stats[i].timestamp, y: stats[i].active_users_monthly || 0});
                }
            }
            res.json(json);
        });
    } else if (req.params.item === 'global_active_halfyear') {
        db.GlobalStat.getStats(function (stats) {
            var json = [
                {
                    name: "Active users 6 months",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                }
            ], i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    json[0].data.push({x: stats[i].timestamp, y: stats[i].active_users_halfyear || 0});
                }
            }
            res.json(json);
        });
    } else if (req.params.item === 'global_pod_count') {
        db.GlobalStat.getStats(function (stats) {
            var json = [
                {
                    name: "Active pods",
                    data: [],
                    color: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6),
                    renderer: 'line'
                }
            ], i = 0;
            if (stats) {
                for (i = 0; i < stats.length; i++) {
                    json[0].data.push({x: stats[i].timestamp, y: stats[i].pod_count || 0});
                }
            }
            res.json(json);
        });
    } else {
        res.json('[]');
    }
};

routes.register = function (req, res, db) {
    req.assert('podhost', 'Invalid pod url').isUrl().len(1, 100);
    var errors = req.validationErrors();
    if (errors) {
        res.send('There have been validation errors: ' + util.inspect(errors), 400);
        return false;
    }
    res.type('text/html');
    res.send('<html><head></head><body><h1>register received</h1><p>if this is a valid pod with suitable code, it will be visible at <a href="https://the-federation.info">the-federation.info</a> in a few seconds..</p></body></html>');
    return req.params.podhost;
};

module.exports = routes;
