/**
 * Created by ivan on 2.10.14.
 */

/*

* spa.chat.js

* Функциональный модуль Chat для SPA

 */

/*jslint            browser : true,     continue : true,
  delev  : ture,    indent : 2,         maxerr   : 50,
  newcap : true,    nomen  : true,      plusplus : true,
  regexp : true,    sloppy : true       vars     : false,
  white  : true
 */


/*global $, spa */

spa.chat = (function(){  // пространство имен для модуля spa.chat
  var
	configMap = {
	  main_html : String()
		+ '<div style="padding:1em; color:#fff;">'
		+ 'Say hello to chat'
		+ '</div>',
	  settable_map : {}
	},
	stateMap  = { $container : null },
	jqueryMap = {},
	setJqueryMap, configModule, initModule;

  // end var define

  //начало метода DOM /setJqueryMap/

  setJqueryMap = function () {
	var $container = stateMap.$container;
	jqueryMap = { $container: $container };
  }

  //конец метода DOM

  //начало открытого метода configModule
  //назначение: настроить допустимые ключи
  //аргументы: хэш настраиваемых ключей и их значений
  // * color_name - какой цвет использовать
  //параметры:
  // * configMap.settable_map объявляет допустимые ключи
  //возвращает: true
  //исключения: нет
  //

  configModule = function ( input_map ) {
	spa.util.setConfigMap({
	  input_map : input_map,
	  settable_map : configMap.settable_map,
	  config_map : configMap
	});
	return true;
  };

  //конец открытого метода configModule

  //начло открытого метода initModule
  //назначение: инициализирует модуль
  //аргументы:
  // * $container елемент Jquery спользуемый этим модулем
  // возвращает: true
  // исключения: none
  //

  initModule = function( $container ){
	$container.html( configMap.main_html );
	stateMap.$container = $container;
	setJqueryMap();
	return true;
  };

  return {
	configModule : configModule,
	initModule : initModule
  }
})();