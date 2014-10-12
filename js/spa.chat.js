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
		+ '<div class="spa-chat">'
		+ '<div class="spa-chat-head">'
		+ '<div class="spa-chat-head-toggle">+</div>'
		+ '<div class="spa-chat-head-title">'
		+ 'Chat'
		+ '</div>'
		+ '</div>'
		+ '<div class="spa-chat-closer">x</div>'
		+ '<div class="spa-chat-sizer">'
		+ '<div class="spa-chat-msgs"></div>'
		+ '<div class="spa-chat-box">'
		+ '<input type="text"/>'
		+ '<div>send</div>'
		+ '</div>'
		+ '</div>'
		+ '</div>',
	  settable_map : {
		slider_open_time    : true,
		slider_close_time   : true,
		slider_opened_em    : true,
		slider_closed_em    : true,
		slider_opened_title : true,
		slider_closed_title : true,

		chat_model      : true,
		people_model    : true,
		set_chat_anchor : true
	  },
	  slider_open_time     : 250,
	  slider_close_time    : 250,
	  slider_opened_em     : 18,
	  slider_closed_em     : 2,
	  slider_opened_title  : 'Click to close',
	  slider_closed_title  : 'Click to open',
	  slider_opened_min_em : 10,
	  window_height_min_em : 20,

	  chat_model      : null,
	  people_model    : null,
	  set_chat_anchor : null
	},
	stateMap  = {
	  $append_target   : null,
	  position_type    : 'closed',
	  px_per_em        : 0,
	  slider_hidden_px : 0,
	  slider_closed_px : 0,
	  slider_opened_px : 0
	},
	jqueryMap = {},
	setJqueryMap, configModule, initModule, getEmSize, setPxSizes, setSliderPosition, onClockToggle;

  	getEmSize = function ( elem ) { // метод для преобразования em в px, чтобы можно было производить измерения в jquery
	  return Number(
		ggetComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
	  );
	};

  // end var define

  //начало метода DOM /setJqueryMap/

  var
	$append_target = stateMap.$append_target,
	$slider = $append_target.find( '.spa-chat');

  jqueryMap = {
	$slider : $slider,
	$head   : $slider.find( '.spa-chat-head' ),
	$toggle : $slider.find( '.spa-chat-head-toggle' ),
	$title  : $slider.find( '.spa-chat-head-title' ),
	$sizer  : $slider.find( '.spa-chat-sizer' ),
	$msgs   : $slider.find( '.spa-chat-msgs' ),
	$box    : $slider.find( '.spa-chat-box' ),
	$input  : $slider.find( '.spa-chat-input input[type=text]')
  };

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