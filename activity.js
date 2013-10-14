var request = require('request')
var fs = require('fs')

var org = process.argv[2]
var token = process.argv[3]
var baseURL = 'https://jlord:'
var endURL = '@api.github.com/'

request(baseURL + token + endURL + 'orgs/' + org + '/members', function (error, response, body) {
  if (error) console.log(error)
  var members = JSON.parse(body)
  var userNames = []
  members.forEach(function (user) {
    var name = user.login
    userNames.push(name)
  })
  fs.writeFile('orgMembers.json', JSON.stringify(userNames, null, "  "), function (error) {
    if (error) console.log(error)
    console.log("yay!")
    getPublicRepos(userNames)
  })
})

function getPublicRepos(names) {
  var counter = names.length
  var data = []
  names.forEach(function (name) {
    request(baseURL + token + endURL + 'users/' + name, function (error, response, body) {
      if (error) console.log(error)
      counter--
      var user = JSON.parse(body)
      var userData = {}
      userData.user = name
      userData.public_repos = user.public_repos
      data.push(userData)
      if (counter === 0) {
        fs.writeFile('allUserRepos.json', JSON.stringify(data, null, "  "), function (err) {
          if (err) console.log(err)
          getRepoDetails(data)
        })
      }
    })
  })
}

function getRepoDetails(data) {
  var data = data
  var counter = data.length
  data.forEach(function (dat) {
    // each user in the data
    var dat = dat
    var user = dat.user
    counter--
    dat.repos = []
    request(baseURL + token + endURL + 'users/' + user + '/repos', function (error, response, body) {
      var allRepos = JSON.parse(body)
      allRepos.forEach(function (repo) {
        if (repo.private === true) return
        var name = repo.name
        var aRepo = {}
        dat.repos.push(aRepo)
        aRepo[name] = {"fork": repo.fork, "forks" : repo.forks_count, "watchers" : repo.watchers_count}
        if (counter === 0) {
          fs.writeFile('allRepos.json', JSON.stringify(data, null, "  "), function (err) {
            if (err) console.log(err)
            getDetails(data)
          })
        }
      })
    })
  })
}

function getDetails(data) {
  data.forEach(function (user) {
    var user = user
    var username = user.user
    var repos =  user.repos
    getCommits(username, repos)
  }) 
}

function getCommits(username, repos) {
  repos.forEach(function (repo) {
    var name = Object.keys(repo)
    console.log(typeof name)
    request(baseURL + token + endURL + 'repos/' + username + '/' + name + '/stats/contributors', function (error, response, body) {
      var stats = JSON.parse(body)
      if (error) console.log(error) 
    }) 
  })
}


