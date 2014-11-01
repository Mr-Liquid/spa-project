/*
 * spa.model.js
 * Model module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa */

spa.model = (function (){
  'use strict';
  var
	configMap = {
	  anon_id : 'a0' //индикатор для анонимного пользователя
	},
	stateMap = {
	  anon_user : null,
	  people_cid_map : {},
	  people_db : TAFFY()
	},
	isFakeData = true, // говорит модели использовать fake данные а не настоящие
	personProto, makePerson, people, initModule;

  personProto = {
	get_is_user : function(){
	  return this.cid === stateMap.user.cid
	},
	get_is_anon : function() {
	  return this.cid === stateMap.anon_user.cid
	}
  };

  makePerson = function( person_map ){
	var person,
	  cid = person_map.cid,
	  css_map = person_map.css_map,
	  id = person_map.id,
	  name = person_map.name;
	if(cid === undefined || !name){
	  throw 'client id and name required'
	}

	person = Object.create(personProto);
	person.cid = cid;
	person.css_map = css_map;
	person.name = name;

	if(id){person.id = id;}

	stateMap.people_cid_map[cid] = person;

	stateMap.people_db.insert(person);
	return person;
  };

  people = {  //определяем объект people
	get_db : function(){return stateMap.people_db;},
	get_cid_map : function(){return stateMap.people_cid_map;}
  };
  initModule = function(){
	var i, people_list, person_map;

	// инициализируем анонимного пользователя

  };






  return {};
}());
