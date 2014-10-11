/*
 * spa.shell.js
 * Shell module for SPA
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, spa */

spa.shell = (function () {
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      anchor_schema_map : {
        chat: { open : true, closed : true}
      },
      main_html : String()
        + '<div class="spa-shell-head">'
          + '<div class="spa-shell-head-logo"></div>'
          + '<div class="spa-shell-head-acct"></div>'
          + '<div class="spa-shell-head-search"></div>'
        + '</div>'
        + '<div class="spa-shell-main">'
          + '<div class="spa-shell-main-nav"></div>'
          + '<div class="spa-shell-main-content"></div>'
        + '</div>'
        + '<div class="spa-shell-foot"></div>'
        + '<div class="spa-shell-chat"></div>'
        + '<div class="spa-shell-modal"></div>',
        chat_extend_time     : 1000,
        chat_retract_time    : 300,
        chat_extend_height   : 450,
        chat_retract_height  : 15,
        chat_extended_title  : 'Щелкните, чтобы свернуть',
        chat_retracted_title : 'Щелкните, чтобы раскрыть'
    },
    stateMap  = {
        $container : null,
        is_chat_retracted : true,
        anchor_map: {} // храним состояние хэшей
    },
    jqueryMap = {},

    setJqueryMap, toggleChat, onClickChat, initModule, copyAnchorMap, changeAnchorPart, onHashchange;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //-------------------- BEGIN UTILITY METHODS -----------------
    copyAnchorMap = function(){
      return $.extend( true, {}, stateMap.anchor_map );
    };
  //--------------------- END UTILITY METHODS ------------------
  setJqueryMap = function () {
	var $container = stateMap.$container;
	jqueryMap = {
	  $container : $container,
	  $chat      : $container.find( '.spa-shell-chat' )
	};
  };
  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/



  // ------------------------------
  // changeAnchorPart
  // назначение: изменя ть якорь в урле
  // Аргументы:
  // * arg_map - хэш описывающий какую чать якоря хотим изменть
  // Возвращает: булево значение
  // * true - якорь в урле обновлен
  // * false - не удалось обновить якорь
  // Действие:
  // сохраняет теущую часть якоря в stateMap.anchor_map
  // Этот метод:
  // * создает копию хэша, вызывая copyAnchorMap()
  // Модифицирует пары ключ-значения с помощью arg_map
  // ------------------------------
  changeAnchorPart = function( arg_map ){
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    // начало объединения изменений в хеше
    KEYVAL:
    for ( key_name in arg_map ){
      if ( arg_map.hasOwnProperty( key_name )){

         // пропустить зависимые ключи
         if ( key_name.indexOf( '_' ) === 0) { continue KEYVAL; }

         // обновить значение независимого ключа
         anchor_map_revise[key_name] = arg_map[key_name];

         // обновить соответствующий зависимый ключ
         key_name_dep = '_' + key_name;
         if ( arg_map[key_name_dep] ) {
           anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
         }
         else {
           delete  anchor_map_revise[key_name_dep];
           delete  anchor_map_revise['_s' + key_name_dep];
         }
      }
    }
    // конец объединения изменений в хеше

    // начало попытки обновления урла, в случае ошибки восстановить исходное состояние
    try {
        $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
        $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
        bool_return = false;
    }
    //конец попытки обновления урла

    return bool_return;
  };

  // End DOM method /setJqueryMap/
    // begin DOM method /toggleChat
  toggleChat = function(do_extend, callback){
    var
      px_chat_ht = jqueryMap.$chat.height(),
      is_open    = px_chat_ht === configMap.chat_extend_height,
      is_closed  = px_chat_ht === configMap.chat_retract_height,
      is_sliding = ! is_open && ! is_closed;

      if( is_sliding ){ return false; }

      // инициализация открытия окна чата
      if( do_extend ){
        jqueryMap.$chat.animate(
          { height: configMap.chat_extend_height },
          configMap.chat_extend_time,
          function (){
            jqueryMap.$chat.attr('title',configMap.chat_extended_title);
            stateMap.is_chat_retracted = false;
            if( callback ){ callback(jqueryMap.$chat); }
          }
        );
        return true;
      }
      // конец инициализации открытия чата

      // инициализация сворачивания окна чата
      jqueryMap.$chat.animate(
        { height : configMap.chat_retract_height },
        configMap.chat_retract_time,
        function () {
          jqueryMap.$chat.attr('title',configMap.chat_retracted_title);
          stateMap.is_chat_retracted = true;
          if ( callback ){ callback( jqueryMap.$chat ); }
        }

      );
      // конец инициализации сворачивания
      return true;
  };

  // end toggleChat
  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

    onHashchange = function ( event ) {
      var
        anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_chat_previous, _s_chat_proposed,
        s_chat_proposed;

      // пытаемся разобрать якорь
      try {
        anchor_map_proposed = $.uriAnchor.makeAnchorMap();
      }
      catch ( error ) {
          $.uriAnchor.setAnchor(anchor_map_previous, null, true);
          return false;
      }
      stateMap.anchor_map = anchor_map_proposed;


      //вспомогательные переменные
      _s_chat_previous = anchor_map_previous._s_chat;
      _s_chat_proposed = anchor_map_proposed._s_chat;

       //начало изменения компонентачат
      if ( ! anchor_map_previous || _s_chat_previous !== _s_chat_proposed ) {
          s_chat_proposed = anchor_map_proposed.chat;
          switch (s_chat_proposed) {
            case 'open' :
              toggleChat( true );
            break;
            case 'closed' :
              toggleChat ( false );
            break;
            default :
              toggleChat( false );
              delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
          }
      }
      return false;
    };
    onClickChat = function( event ){
        changeAnchorPart({
          chat : ( stateMap.is_chat_retracted ? 'open' : 'closed' )
        });
        return false;
    };
  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /initModule/
  initModule = function ( $container ) {
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    stateMap.is_chat_retracted = true;
    jqueryMap.$chat.attr('title', configMap.chat_extended_title).click( onClickChat );

      //начтраиваем uriAnchor на использование нашей схемы
      //конфигурируем подключаемый модуль uriAnchor для проверки по схеме.
      $.uriAnchor.configModule({
         schema_map : configMap.anchor_schema_map
      });

	spa.chat.configModule( {} );
	spa.chat.initModule( jqueryMap.$chat );

      //обрабатываем мобытия изменения якоря
      //это делается после того как все функциональные модули
      //сконфигурированы и инициализированы, иначе они будут не готовы
      //возбудить событие, котороеиспользуется, чтобы гарантировать учет якоря при загрузке.
      $(window).bind( 'hashchange', onHashchange).trigger( 'hashchange' );
      //привязываем обработчик события hashchange и сразу возбуждаем событие, чтобы модуль учитывал закладку
      //на этапе начальной загрузки


  };
  // End PUBLIC method /initModule/

  return { initModule : initModule };
  //------------------- END PUBLIC METHODS ---------------------
}());
