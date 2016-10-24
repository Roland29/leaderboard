// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");

if (Meteor.isClient) {
  var scoreIncrement = 5;
  Session.setDefault('selectedPlayers', []);
  Template.leaderboard.helpers({
    players: function() {
      return Players.find({}, {
        sort: {
          score: -1,
          name: 1
        }
      });
    },
    selectedName: function() {
      var selectedPlayers = Session.get("selectedPlayers");
      switch (selectedPlayers.length) {
        case 0:
          return false;

        case 1:
          var player = Players.findOne(selectedPlayers[0]);
          return player && player.name;

        default:
          return selectedPlayers.length + " selected players";
      }
    },
    scoreIncrement: function() {
      return scoreIncrement
    }
  });

  Template.leaderboard.events({
    'click .inc': function() {
      var selectedPlayers = Session.get("selectedPlayers");
      for (var i=0;i<selectedPlayers.length;i++)
        Players.update(selectedPlayers[i],{
        $inc: {
          score: scoreIncrement
        }
      });
    }
  });

  Template.player.helpers({
    selected: function() {
      console.log(Session.get("selectedPlayers").indexOf(this._id));
      console.log(this._id);
      return Session.get("selectedPlayers").indexOf(this._id) !== -1 ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function() {
      var selectedPlayers=Session.get("selectedPlayers");
      var index = selectedPlayers.indexOf(this._id);
      if (index !== -1) // On désélectionne le joueur
        selectedPlayers.splice(index, 1);
      else // On le sélection
        selectedPlayers.push(this._id);
      Session.set("selectedPlayers", selectedPlayers);
    },
    'click button.delete': function(event, template) {
      event.stopPropagation();
      var playerName = template.data.name;
      console.log('Let\'s remove this player : ', playerName);
    }
  });

  Template.addPlayer.events({
    'submit': function(event, template) {
      event.preventDefault();
      var newPlayerName = template.find('input').value;
      console.log('Add a new player : ' + newPlayerName);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function() {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace", "Grace Hopper", "Marie Curie",
        "Carl Friedrich Gauss", "Nikola Tesla", "Claude Shannon"
      ];
      _.each(names, function(name) {
        Players.insert({
          name: name,
          score: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });
}