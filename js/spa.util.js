/**
 * Created by ivan on 2.10.14.
 */
/*
 * spa.util.js
 * General JavaScript utilities
 *
 * Michael S. Mikowski - mmikowski at gmail dot com
 * These are routines I have created, compiled, and updated
 * since 1998, with inspiration from around the web.
 *
 * MIT License
 *
 */

/*jslint          browser : true,  continue : true,
 devel  : true,  indent  : 2,     maxerr   : 50,
 newcap : true,  nomen   : true,  plusplus : true,
 regexp : true,  sloppy  : true,  vars     : false,
 white  : true
 */
/*global $, spa */

spa.utils = (function(){
  var makeError, setConfigMap;

  //начало открытого конструктора makeError
  //назначение: обертка для создания объета ошибки
  //аргументы:
  // * name_text - имя ошибки
  // * msg_text - длинное сосбщение об ошибке
  // * data - необязательные данные сопровождающие объект ошибки
  //исключения: нет
  //

  makeError = function( name_text, msg_text, data ){
	var error = new Error();
	error.name = name_text;
	error.message = msg_text;

	if ( data ) { error.data = data; }

	return error;
  }
  // конец открытогоконструктора

  //setConfigMap
  //назначение: установка конфигурационных параметров в функциональных модулях
  //аргументы:
  // * input_map - хэш ключей и значений, устанавливаемых в config
  // * settable_map - хэш доступных ключей
  // * config_map - хэш к которому применяются новые параметры
  //возвращает: true
  //исключения: если входной ключ недопустим

  setConfigMap = function( arg_map ){
	var
      input_map = arg_map.input_map,
	  settable_map = arg_map.settable_map,
	  config_map = arg_map.config_map,
	  key_name, error;
  }



})();