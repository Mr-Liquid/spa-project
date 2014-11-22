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
      stateMap  = {
          anon_user      : null,
          cid_serial     : 0,
          people_cid_map : {},
          people_db      : TAFFY(),
          user           : null,
          is_connected   : false // определяет находится ли пользователь в чате
      },
	isFakeData = true, // говорит модели использовать fake данные а не настоящие
      personProto, makeCid, clearPeopleDb, completeLogin,
      makePerson, removePerson, people, initModule, chat;
    // The people object API
    // ---------------------
    // The people object is available at spa.model.people.
    // The people object provides methods and events to manage
    // a collection of person objects. Its public methods include:
    //   * get_user() - return the current user person object.
    //     If the current user is not signed-in, an anonymous person
    //     object is returned.
    //   * get_db() - return the TaffyDB database of all the person
    //     objects - including the current user - presorted.
    //   * get_by_cid( <client_id> ) - return a person object with
    //     provided unique id.
    //   * login( <user_name> ) - login as the user with the provided
    //     user name. The current user object is changed to reflect
    //     the new identity. Successful completion of login
    //     publishes a 'spa-login' global custom event.
    //   * logout()- revert the current user object to anonymous.
    //     This method publishes a 'spa-logout' global custom event.
    //
    // jQuery global custom events published by the object include:
    //   * spa-login - This is published when a user login process
    //     completes. The updated user object is provided as data.
    //   * spa-logout - This is published when a logout completes.
    //     The former user object is provided as data.
    //
    // Each person is represented by a person object.
    // Person objects provide the following methods:
    //   * get_is_user() - return true if object is the current user
    //   * get_is_anon() - return true if object is anonymous
    //
    // The attributes for a person object include:
    //   * cid - string client id. This is always defined, and
    //     is only different from the id attribute
    //     if the client data is not synced with the backend.
    //   * id - the unique id. This may be undefined if the
    //     object is not synced with the backend.
    //   * name - the string name of the user.
    //   * css_map - a map of attributes used for avatar
    //     presentation.
    //

  personProto = {
	get_is_user : function(){
	  return this.cid === stateMap.user.cid
	},
	get_is_anon : function() {
	  return this.cid === stateMap.anon_user.cid
	}
  };
  makeCid = function(){ // генератор клиентского ай ди
    return 'c' + String( configMap.cid_serial++ );
  };
  clearPeopleDb = function(){ // этот метод удаляет все объекты person кроме ананимного и, ксли пользователь ауинтефецирован, объекта, представляющего текущего пользователя
    var user = stateMap.user;
    stateMap.people_db = TAFFY();
    stateMap.people_cid_map = {};

    if( user ){
      stateMap.people_db.insert(user);
      stateMap.people_cid_map[user.cid] = user;
    }
  };
  completeLogin = function( user_list ){
    var user_map = user_list[0];
    delete stateMap.people_cid_map[user_map.cid];
    stateMap.user.cid = user_map._id;
    stateMap.user.id = user_map._id;
    stateMap.user.css_map = user_map.css_map;
    stateMap.people_cid_map[user_map._id] = stateMap.user;

    // когда добавится объект chat, здесь нужно будет войти в чат
      $.gevent.publish('spa-login',[stateMap.user]);
  };
    makePerson = function ( person_map ) {
        var person,
            cid     = person_map.cid,
            css_map = person_map.css_map,
            id      = person_map.id,
            name    = person_map.name;

        if ( cid === undefined || ! name ) {
            throw 'client id and name required';
        }

        person         = Object.create( personProto );
        person.cid     = cid;
        person.name    = name;
        person.css_map = css_map;

        if ( id ) { person.id = id; }

        stateMap.people_cid_map[ cid ] = person;

        stateMap.people_db.insert( person );
        return person;
    };
    removePerson = function ( person ) {
        if ( ! person ) { return false; }
        // cannot remove anonymous person
        if ( person.id === configMap.anon_id ) {
            return false;
        }

        stateMap.people_db({ cid : person.cid }).remove();
        if ( person.cid ) {
            delete stateMap.people_cid_map[ person.cid ];
        }
        return true;
    };

  people = (function(){ //замыкание people позваляет показывать методы которые хотим
      var get_by_cid, get_db, get_user, login, logout;

      get_by_cid = function(cid){
        return stateMap.people_cid_map[cid];
      };
      get_db = function(){ // возвращает TaffyDB коллекцию объектов person
        return stateMap.people_db;
      };
      get_user = function(){ // возвращает объет person представляющего текущего пользователя
        return stateMap.user;
      };
      login = function(name){
        var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

        stateMap.user = makePerson({
          cid : makeCid(),
          css_map : {top : 25, left : 25, 'background-color':'#8f8'},
          name : name
        });

        sio.on('userupdate', completeLogin); // регистрируем обратный вызов, который завершает аутентификацию, когда сервер публикует сообщение userupdate
        sio.emit('adduser',{ // посылаем серверу сообщение adduser вместе со всеми данными о пользователе
            cid     : stateMap.user.cid,
            css_map : stateMap.user.css_map,
            name    : stateMap.user.name
        });
      };

      logout = function(){ //публикует событие spa-logout
        var is_removed, user = stateMap.user;
         // когда добавится объект chat здесь нужно будет выйти из чата
         is_removed = removePerson(user);
         stateMap.user = stateMap.anon_user;

          $.gevent.publish('spa-logout', [user]);
          return is_removed;
      };
      return {
          get_by_cid : get_by_cid,
          get_db     : get_db,
          get_user   : get_user,
          login      : login,
          logout     : logout
      };

  })();
    chat = (function(){
      var
        _publish_listchange,
        _update_list, _leave_chat, join_chat;

        //внутренние методы

        _update_list = function( arg_list){ //обновляет объект people послк получения нового списка людей.
          var i, person_map, make_person_map,
              people_list = arg_list[ 0 ];
        clearPeopleDb();

        PERSON:
        for( i = 0; i < people_list.length; i++){
          person_map = people_list[ i ];

          if(!person_map.name){ continue PERSON;}
          //если пользователь определенб обновить css_map и ольше ничего не делать
          if(stateMap.user && stateMap.user.id === person_map._id){
             stateMap.user.css_map = person_map.css_map;
             continue PERSON;
          }
          make_person_map = {
              cid: person_map._id,
              css_map: person_map.css_map,
              id: person_map._id,
              name: person_map.name
          };

          makePerson( make_person_map );
        }
            stateMap.people_db.sort('name');
        };

        _publish_listchange = function( arg_list ){ //публикует глобальное пользовательское событие spa-listchange сопровождаемое обновленным списком людей
            _update_list(arg_list);
            $.gevent.publish('spa-listchange',[arg_list]);
        };

        //конец внутренних методов

        _leave_chat = function(){ // отправляет серверу сообщение leavechat и очищает переменные состояния
            var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

            stateMap.is_connected = false;
            if( sio ) { sio.emit( 'leavechat') }
        }

        join_chat = function(){ //вызывается, чтобы войти в чат. Он проверяет находится ли уже пользователь в сети stateMap.is_connected чтобы не регистрировать обрабочтик события listchange более одного раза
            var sio;

            if(stateMap.is_connected){
                return false;
            }
            if( stateMap.user.get_is_anon()){
                console.log('User must be defined befor joining chat');
                return false;
            }

            sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
            sio.on('listchange', _publish_listchange);
            return true;
        }

        return {
            _leave: _leave_chat,
            join: join_chat
        }
    })();
  initModule = function(){
	var i, people_list, person_map;
	// инициализируем анонимного пользователя
    stateMap.anon_user = makePerson({
        id : configMap.anon_id,
        cid : configMap.anon_id,
        name : 'anonymous'
    });
    stateMap.user = stateMap.anon_user;

//      if ( isFakeData ) {
//          people_list = spa.fake.getPeopleList();
//          for ( i = 0; i < people_list.length; i++ ) {
//              person_map = people_list[ i ];
//              makePerson({
//                  cid     : person_map._id,
//                  css_map : person_map.css_map,
//                  id      : person_map._id,
//                  name    : person_map.name
//              });
//          }
//      }
  };
  return {
    initModule : initModule,
    people : people,
    chat: chat
  };
}());
