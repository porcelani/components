(function(){
	'use strict';

	AdvancedSearch.$inject = ['GumgaSearchHelper'];
	function AdvancedSearch(GumgaSearchHelper){
		var template =
		'   <div class="input-group">' +
		'       	<span class="input-group-btn" dropdown is-open="status.isopen" ng-show="$parent.saveQuery">'+
		'						<span dropdown on-toggle="toggled(open)">'+
		'							<a href id="simple-dropdown" class="btn btn-default" style="margin-right:-3px;" dropdown-toggle>'+
		'								<i class="glyphicon glyphicon-hourglass"></i>	'+
		'							</a>'+
		'							<ul class="dropdown-menu" aria-labelledby="simple-dropdown" style="width: auto;">'+
		'								<li ng-repeat="choice in $parent.availableQueries">'+
		'									<a href ng-click="doQuery(choice)">{{choice.description}}</a>'+
		'								</li>'+
		'							</ul>'+
		'						</span>'+
		'       	</span>' +
		'       <input type="text" ng-model="searchInputText" class="form-control" ng-disabled="isPanelOpen" id="textMain"/> ' +
		'       <span class="input-group-btn">' +
		'           <button class="my-button btn-default" ng-click="showLittlePanel = !showLittlePanel"><span class="glyphicon glyphicon-chevron-down"></span></button>' +
		'           <button class="my-button btn-default" type="button" ng-click="isPanelOpen = !isPanelOpen"><span class="glyphicon glyphicon-filter"></span>' +
		'           <button class="my-button btn-primary last" type="button" ng-disabled="isPanelOpen" ng-click="doSearch(searchInputText)"><span class="glyphicon glyphicon-search"></span> <span gumga-translate-tag="search.searchbutton"></span>' +
		'       </span>' +
		'   </div>' +
		'   <div class="panel panel-down" ng-show="isPanelOpen">' +
		'       <div class="panel-body">' +
		'						<div class="row">' +
		'								<div class="col-md-3">' +
		'                   <div class="list-holder">' +
		'												<ul class="list-selectable" ng-show="selectAttribute">\n' +
		'                        		<li ng-repeat="attr in attributes" ng-click="attributeHasChanged(attr)" class="hover-list"><button class="btn btn-link" gumga-translate-tag="{{translate + \'.\' + attr.name}}"></button></li>\n' +
		'                    		</ul>\n' +
		'										</div>' +
		'                		<button type=button class="btn btn-default btn-block" ng-click="selectAttribute = !selectAttribute" >{{query.attribute.name || \'Attribute\'}} <span class="caret"></span></button>' +
		'								</div>' +
		'								<div class="col-md-3">' +
		'              			<div class="list-holder">' +
		'                    		<ul class="list-selectable" ng-show="selectHQL">\n' +
		'                        		<li ng-repeat="opt in hqlOpts" class="hover-list" ng-click="handleHqlOption(opt)"><button class="btn btn-link" >{{opt.label}}</button></li>\n' +
		'   		             		</ul>\n' +
		'		            		</div>' +
		'            				<button type="button" class="btn btn-default btn-block" ng-click="selectHQL = !selectHQL"> {{ query.hql.label || \'HQL\'  }} <span class="caret"></span></button>  '+
		'								</div>' +
		'								<div class="col-md-4">' +
		'            				<input ng-show="typeInput == \'checkbox\'" type="checkbox" class="form-control" ng-model="query.value" ng-true-value="\'true\'" ng-false-value="\'false\'" id="selectableAdvancedValue" />'  +
		'            				<input ng-show="typeInput == \'text\'" type="text" class="form-control" ng-model="query.value" id="selectableAdvancedValue" />'  +
		'								</div>' +
		'								<div class="col-md-2">' +
		'            				<button type="button" class="btn btn-default btn-block" ng-click="addQuery(query)" ng-disabled="query.value.length > 0 ? false : true"><span class="glyphicon glyphicon-plus"></span></button>' +
		'								</div>' +
		'						</div>' +
		'       </div>'+
		'				<hr/>' +
		'       <div class="panel-body">' +
		'				<div class="row">' +
		'       		<div class="col-md-10">' +
		'       				<gumga-advanced-label ng-repeat="query in queries" attr="{{query.attribute.name}}" hql="{{query.hql.label}}" value="query.value" index="$index" style="margin-right: 1%"></gumga-advanced-label>' +
		'						</div>' +
		'       		<div class="col-md-2">' +
		'       				<button class="btn btn-primary btn-block" type="button" ng-disabled="queries.length == 0" ng-click="showArray(queries)"><span class="glyphicon glyphicon-search"></span>' +
		'       		</div>' +
		'				</div>' +
		'       </div>' +
		'       <div class="clearfix" style="margin-bottom: 2%"></div>' +
		'   </div>' +
		'<div class="little-panel" ng-show="showLittlePanel">' +
		'   <div class="panel-body">' +
		'       <label ng-repeat="field in normalFields" style="display: block" ><input type="checkbox" ng-model="models[field.value]" style="margin-right: 1%" ><span gumga-translate-tag="{{ translate + \'.\' + field.value}}"></span></label>' +
		'   </div>' +
		'</div>';
		return {
			restrict: 'E',
			template: template,
			scope: false,
			require: '^?gumgaSearch',
			link: function(scope,elm,attrs,ctrl){
				scope.isPanelOpen = false;
				scope.selectHQL = false;
				scope.models = {};
				scope.searchField = '';
				scope.translate = scope.$parent.entityToTranslate;

				scope.doQuery = function (choice) {
					var query = JSON.parse(choice.value);
					scope.$emit('advanced', {hql: GumgaSearchHelper.translateArrayToHQL(query), source: query});
				}

				scope.$on('_doSearch',function(){
					if(scope.queries.length != 0){
						scope.showArray(scope.queries);
					} else {
						if(scope.searchInputText){
							scope.doSearch(scope.searchInputText);
						}
					}
				});

				scope.$on('_focus',function(){
					if(scope.isPanelOpen){
						document.getElementById('selectableAdvancedValue').focus();
					} else {
						document.getElementById('textMain').focus();
					}
				});

				if(!scope.$parent.normalFields.length > 0 || !scope.$parent.entityToTranslate){
					throw 'Missing some parameters in GumgaSearch';
				}

				scope.normalFields = scope.$parent.normalFields.map(function(elm,$index){
					scope.models[elm] = false;
					$index == 0 && (scope.models[elm] = true);
					return {
						name: elm.slice(0,1).toUpperCase() + elm.slice(1,elm.length).toLowerCase(),
						value: elm
					};
				});


				scope.$on('showPanel',function(){
					scope.isPanelOpen = !scope.isPanelOpen;
					scope.$apply();
				});

				scope.models.returnString = function(){
					var txt = '';
					for(var key in this) if(this.hasOwnProperty(key) && key != 'returnString' && this[key]){
						txt += key + ',';
					}
					if(txt.length == 0){
						return scope.normalFields[0].value;
					}
					return txt.slice(0,-1);
				};

				scope.$watch('isPanelOpen',function(){
					if(scope.isPanelOpen === true){
						scope.selectAttribute = true;
					} else {
						scope.queries = [];
					}
					scope.query = {};
				});
				scope.attributes = scope.$parent.attributes;
				scope.hqlOpts = [];
				scope.queries = [];

				scope.attributeHasChanged = function(attribute) {
					scope.query.attribute = attribute;
					switch (attribute.type) {
						case 'boolean': scope.typeInput = 'checkbox'; break;
						default: scope.typeInput = 'text';
					}
					scope.hqlOpts = GumgaSearchHelper.getTypeListOfHQLPossibilities(attribute.type);
					scope.selectHQL = true ;
					scope.selectAttribute = false;
				};

				scope.handleHqlOption = function(hq){
					scope.query.hql = hq;
					scope.selectHQL = false;
				};

				angular.element(document.getElementById('selectableAdvancedValue'))
				.on('keydown',function(ev){
					if(ev.keyCode == 13 && ev.target.value.length > 0){
						scope.addQuery(scope.query);
					}
					scope.$apply();
				});

				angular.element(document.getElementById('textMain'))
				.on('keydown',function(ev){
					if(ev.keyCode == 13 && ev.target.value.length > 0){
						scope.$emit('normal',{field: scope.models.returnString(),param:scope.searchInputText || ''});
						if(scope.showLittlePanel){
							scope.showLittlePanel = !scope.showLittlePanel;
						}
					}
				});

				scope.addQuery = function(query){
					if(scope.queries.length === 0){
						scope.queries.push(query);
					} else if(scope.queries.length >= 1){
						scope.queries.splice(scope.queries.length,1,{value: 'AND'},query);
					}
					scope.query = {};
					scope.typeInput = 'text';
				};

				scope.$on('deletepls',function(ev,index){
					if (index == 0 && scope.queries.length == 1) {
						scope.queries.splice(index, 1);
					} else if (index == 0 && scope.queries.length > 2) {
						scope.queries.splice(index, 2);
					} else if (index > 0 && scope.queries.length > 2) {
						scope.queries.splice(index - 1, 2);
					}
				});

				scope.showArray = function(array){
					scope.isPanelOpen = false;
					scope.$emit('advanced',{hql: GumgaSearchHelper.translateArrayToHQL(array),source: array});
				};

				scope.doSearch = function(txt){
					scope.$emit('normal',{field: scope.models.returnString(),param:txt || ''});
					scope.searchInputText = '';
				};
			}
		};
	}
	angular.module('gumga.directives.search.advancedsearch',['gumga.directives.search.searchhelper'])
	.directive('gumgaAdvancedSearch',AdvancedSearch)
})();
