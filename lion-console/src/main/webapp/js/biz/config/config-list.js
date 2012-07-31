var Type_String = 10;
var Type_Number = 20;
var Type_Bool = 30;
var Type_List_Str = 40;
var Type_List_Num = 45;
var Type_Map = 50;

/**是否在新打开的模态窗口中创建过新的config*/
var modal_config_created = false;
var modal_config_edited = false;
var display_all_btn = false;
var $config_list_editor;
var $config_map_editor;
var $clearAlert;
var $deleteAlert;
var $deployAlert;
var $pushAlert;
var $commonAlert;

$(function(){
	$(".icon-intro").popover();
	bindConfigTableEvents();
	$config_list_editor = $("#list-editor").listeditor();
	$config_map_editor = $("#map-editor").mapeditor();
	
	$clearAlert = $("<div>确认清除该配置项值? [<font color='green'>不可恢复</font>]</div>")
		.dialog({
			autoOpen : false,
			resizable : false,
			modal : true,
			title : "提示框",
			height : 140,
			buttons : {
				"是" : function() {
					$(this).dialog("close");
					$.ajax("/config/clearInstanceAjax.vhtml".prependcontext(), {
						data: $.param({
							"configId" : $(this).data("configId"),
							"envId" : $("#envId").val()
						}, true),
						dataType: "json",
						success: function(result) {
							if (result.code == Res_Code_Success) {
								reloadConfigListTable();
							} else if (result.code == Res_Code_Error) {
								$commonAlert.html(result.msg).dialog("open");
							}
						}
					});
				},
				"否" : function() {$(this).dialog("close");}
			}
		});
		
	$deleteAlert = $("<div>确认删除该配置项? [<font color='green'>不可恢复</font>]</div>")
		.dialog({
			autoOpen : false,
			resizable : false,
			modal : true,
			title : "提示框",
			height : 140,
			buttons : {
				"是" : function() {
					$(this).dialog("close");
					$.ajax("/config/deleteAjax.vhtml".prependcontext(), {
						data: $.param({
							"configId" : $(this).data("configId")
						}, true),
						dataType: "json",
						success: function(result) {
							if (result.code == Res_Code_Success) {
								reloadConfigListTable();
							} else if (result.code == Res_Code_Error) {
								$commonAlert.html(result.msg).dialog("open");
							}
						}
					});
				},
				"否" : function() {$(this).dialog("close");}
			}
		});
		
	$commonAlert = $("<div class='alert-body'></div>")
		.dialog({
			autoOpen : false, 
			resizable : false,
			modal : true,
			title : "信息框",
			height : 140,
			buttons : {
				"确定" : function() {$(this).dialog("close");}
			}
		});
		
	$deployAlert = $("<div class='alert-body'>确认推送该配置到配置服务器?<br/>[<span class='key'></span>]</div>")
		.dialog({
			autoOpen : false, 
			resizable : false,
			modal : true,
			title : "信息框",
			height : 140,
			buttons : {
				"确认" : function() {
					$(this).dialog("close");
					$.ajax("/config/deployConfigAjax.vhtml".prependcontext(), {
						data: $.param({
							"configId" : $(this).data("configId"),
							"envId" : $("#envId").val()
						}, true),
						dataType: "json",
						success: function(result) {
							if (result.code == Res_Code_Success) {
								reloadConfigListTable();
								$commonAlert.html("部署成功.").dialog("open");
							} else if (result.code == Res_Code_Error) {
								$commonAlert.html("部署失败" + (result.msg.isBlank() ? "": ":" + result.msg) + "!").dialog("open");
							}
						}
					});
				},
				"取消" : function() {$(this).dialog("close");}
			}
		});
		
	$pushAlert = $("<div class='alert-body'>确认推送该配置到配置服务器并通知应用?<br/>[<span class='key'></span>]</div>")
		.dialog({
			autoOpen : false, 
			resizable : false,
			modal : true,
			title : "信息框",
			height : 140,
			buttons : {
				"确认" : function() {
					$(this).dialog("close");
					$.ajax("/config/pushConfigAjax.vhtml".prependcontext(), {
						data: $.param({
							"configId" : $(this).data("configId"),
							"envId" : $("#envId").val()
						}, true),
						dataType: "json",
						success: function(result) {
							if (result.code == Res_Code_Success) {
								reloadConfigListTable();
								$commonAlert.html("推送成功.").dialog("open");
							} else if (result.code == Res_Code_Error) {
								$commonAlert.html("推送失败" + (result.msg.isBlank() ? "": ":" + result.msg) + "!").dialog("open");
							}
						}
					});
				},
				"取消" : function() {$(this).dialog("close");}
			}
		});
	
	$("#add-config-modal").on("hidden", function() {
		resetConfigForm();
		if (modal_config_created) {
			reloadConfigListTable();
		}
	});
	
	$("#add-config-modal").on("show", function() {
		modal_config_created = false;
		resetConfigForm();	//fix firefox bug: 选中下拉项，刷新页面，再打开下拉项仍是刚才的选中项
	});
	
	$("#edit-config-modal").on("show", function() {
		modal_config_edited = false;
		var config_id = $("#edit-config-modal [name='config-id']").val();
		var env_id = $("[name='envId']").val();
		$.ajax("/config/defaultValueAjax.vhtml".prependcontext(), {
			data : $.param({
				"configId" : config_id,
				"envId" : env_id
			}, true),
			dataType : "json",
			success : function(result) {
				$("#edit-config-modal").hideAlerts();
				if (result.code == Res_Code_Success) {
					var config_type = parseInt($("#edit-config-type-selector").val());
					if (config_type == Type_Bool) {
						$("[name='edit-config-value'][value='" + result.value + "']").attr("checked", true);
					} else {
						$("#edit-config-value").val(result.value);
					}
					if (!result.msg.isBlank()) {
						$("#edit-config-modal .form-info").showAlert(result.msg);
					}
				} else if (result.code == Res_Code_Error) {
					$("#edit-config-modal .form-error").showAlert(result.msg);
					$("#edit-save-btn,#edit-more-btn").attr("disabled", true);
				}
			}
		});
	});
	
	$("#edit-config-modal").on("hidden", function() {
		if (modal_config_edited) {
			reloadConfigListTable();
		}
	});
	
	$("#if-deploy").click(function() {
		if ($(this).is(":checked")) {
			$("#if-push").attr("disabled", false);
		} else {
			$("#if-push").attr("disabled", true);
			$("#if-push").attr("checked", false);
		}
	});
	
	$("#edit-if-deploy").click(function() {
		if ($(this).is(":checked")) {
			$("#edit-if-push").attr("disabled", false);
		} else {
			$("#edit-if-push").attr("disabled", true);
			$("#edit-if-push").attr("checked", false);
		}
	});
	
	$("#edit-save-btn").click(function() {
		if (validateEditConfigForm()) {
			var envs = new Array();
			$(":checkbox[name='edit-config-env']:checked").each(function() {envs.push($(this).val());});
			if (envs.length > 0) {
				$.ajax("/config/saveDefaultValueAjax.vhtml".prependcontext(), {
					data : $.param({
						"configId" : $("#edit-config-modal [name='config-id']").val(),
						"envIds" : envs,
						"trim" : $("#edit-trim-checkbox").is(":checked"),
						"ifDeploy" : $("#edit-if-deploy").is(":checked"),
						"ifPush" : $("#edit-if-push").is(":checked"),
						"value" : $("#edit-config-value").length > 0 ? $("#edit-config-value").val() : $(":radio[name='edit-config-value']:checked").val()
					}, true),
					dataType: "json",
					success : function(result) {
						$("#edit-config-modal").hideAlerts();
						if (result.code == Res_Code_Success) {
							modal_config_edited = true;
							$("#edit-config-modal .form-info").showAlert("设置配置项值成功.");
						} else if (result.code == Res_Code_Error) {
							$("#edit-config-modal .form-error").showAlert(result.msg);
						} else if (result.code == Res_Code_Warn) {
							modal_config_edited = true;
							$("#edit-config-modal .form-warn").showAlert(result.msg);
						}
					}
				});
			}
		}
	});
	
	$("#edit-more-btn").click(function() {
		$(location).attr("href", ("/config/editMore.vhtml?" + $("#queryStr").val() + "&" + $("#criteriaStr").val()).prependcontext() 
			+ "&configId=" + $("#edit-config-modal [name='config-id']").val());
	});
	
	$("#save-btn").click(function() {
		if (validateConfigForm()) {
			var envs = new Array();
			$(":checkbox[name='config-env']:checked").each(function() {envs.push($(this).val());});
			$.ajax("/config/createConfigAjax.vhtml".prependcontext(), {
				data: $.param({
					"config.key" : $("#config-key").val().trim(),
					"config.desc" : $("#config-desc").val().trim(),
					"config.type" : $("#config-type-selector").val(),
					"config.projectId" : $("#projectId").val(),
					"trim" : $("#trim-checkbox").is(":checked"),
					"envIds" : envs,
					"ifDeploy" : $("#if-deploy").is(":checked"),
					"ifPush" : $("#if-push").is(":checked"),
					"value" : $("#config-value").length > 0 ? $("#config-value").val() : $(":radio[name='config-value']:checked").val()
				}, true),
				dataType: "json",
				success: function(result) {
					if (result.code == Res_Code_Success) {
						modal_config_created = true;
						resetConfigForm(["config-env", "if-deploy"]);
						$("#add-config-modal .form-info").flashAlert("创建成功，请继续添加.", 4000);
					} else if (result.code == Res_Code_Error) {
						resetConfigAlerts();
						$("#add-config-modal .form-error").showAlert(result.msg);
					} else if (result.code == Res_Code_Warn) {
						modal_config_created = true;
						resetConfigForm(["config-env", "if-deploy"]);
						$("#add-config-modal .form-warn").showAlert(result.msg);
					}
				}
			});
		}
	});
	
	function reloadConfigListTable() {
		$("#config-list-container").load("/config/configListAjax.vhtml".prependcontext(), $.param({
			"pid" : $("[name='pid']").val(),
			"envId" : $("[name='envId']").val(),
			"criteria.key" : $("#key").val(),
			"criteria.value" : $("#value").val(),
			"criteria.status" : $("#status").val()
		}, true), function() {
			bindConfigTableEvents();
			$("#display-all-btn").attr("checked", display_all_btn).triggerHandler("click");
		});
	}
	
	$("#select-all-env").click(function() {
		$(":checkbox[name='config-env']:enabled").attr("checked", $(this).is(":checked"));
	});
	
	$("#edit-select-all-env").click(function() {
		$(":checkbox[name='edit-config-env']:enabled").attr("checked", $(this).is(":checked"));
	});
	
	$("#config-type-selector").change(function() {
		var type = parseInt($(this).val());
		clearValidateError($("#config-value"));
		$("#config-value-container").html(generateValueComponent(type, "config-value"));
	});
	
	function generateValueComponent(type, inputId) {
		switch (type) {
			case Type_String : return generateStringComponent(inputId);
			case Type_Number : return generateNumberComponent(inputId);
			case Type_Bool : return generateBoolComponent(inputId);
			case Type_List_Num : return generateListComponent(inputId, true);
			case Type_List_Str : return generateListComponent(inputId, false);
			case Type_Map : return generateMapComponent(inputId);
		}
	}
	
	function generateStringComponent(inputId) {
		return "<textarea id='" + inputId + "' rows='7' style='width:350px;'></textarea>";
	}
	
	function generateNumberComponent(inputId) {
		return "<input type='text' id='" + inputId + "' class='input-medium'>"
			+ "<span class='help-inline hide message'>数字,必填!</span>";
	}
	
	function generateBoolComponent(inputId) {
		return "<input type='radio' name='" + inputId + "' id='" + inputId + "-yes' value='true' checked='checked'"
			+ "><label for='" + inputId + "-yes' class='help-inline'>true</label>"
			+ "<input type='radio' name='" + inputId + "' id='" + inputId + "-no' value='false'"
			+ "><label for='" + inputId + "-no' class='help-inline'>false</label>";
	}
	
	function generateListComponent(inputId, numberlist) {
		return "<textarea id='" + inputId + "' rows='7' style='width:350px;' readonly='readonly' onclick='openListEditor(\"" + inputId + "\", " + numberlist + ", event);'></textarea>"
			+ "<a href='#' onclick='openListEditor(\"" + inputId + "\", " + numberlist + ", event);'><i class='icon-edit' style='vertical-align:bottom;'></i></a>";
	}
	
	function generateMapComponent(inputId) {
		return "<textarea id='" + inputId + "' rows='7' style='width:350px;' readonly='readonly' onclick='openMapEditor(\"" + inputId + "\", event);'></textarea>"
			+ "<a href='#' onclick='openMapEditor(\"" + inputId + "\", event);'><i class='icon-edit' style='vertical-align:bottom;'></i></a>";
	}
	
	function validateConfigForm() {
		var checkPass = true;
		resetConfigFormValidation();
		$("#config-key,#config-desc").each(function() {
			if ($(this).val().isBlank()) {
				setValidateError($(this));
				checkPass = false;
			}
		});
		if (parseInt($("#config-type-selector").val()) == Type_Number
				&& !$("#config-value").val().isNumber()) {
			setValidateError($("#config-value"));
			checkPass = false;
		}
		return checkPass;
	}
	
	function validateEditConfigForm() {
		var checkPass = true;
		resetConfigFormValidation();
		if (parseInt($("#edit-config-type-selector").val()) == Type_Number
				&& !$("#edit-config-value").val().isNumber()) {
			setValidateError($("#edit-config-value"));
			checkPass = false;
		}
		return checkPass;
	}
	
	function setValidateError($element) {
		$element.parents(".control-group").addClass("error");
		$element.next(".message").show();
	}
	
	function clearValidateError($element) {
		$element.parents(".control-group").removeClass("error");
		$element.next(".message").hide();
	}
	
	function resetConfigForm(excepts) {
		resetConfigFormInput(excepts);
		resetConfigFormValidation();
		resetConfigAlerts();
	}
	
	function resetEditConfigForm() {
		$("#edit-config-modal").hideAlerts();
		$("#edit-trim-checkbox").attr("checked", true);
		resetConfigFormValidation();
		$("#edit-select-all-env,[name='edit-config-env']").attr("checked", false);
		$("#edit-save-btn,#edit-more-btn").attr("disabled", false);
		$("#edit-if-deploy").attr("checked", false).triggerHandler("click");
	}
	
	function resetConfigAlerts() {
		$("#add-config-modal").hideAlerts();
	}
	
	function resetConfigFormInput(excepts) {
		var excepts_ = typeof excepts != "undefined" ? excepts : [];
		$("#config-type-selector").val($("#config-type-selector option:first").val()).change();
		$("#config-key").val($("#projectName").val() + ".");
		$("#config-desc,#config-value").val("");
		$("#trim-checkbox").attr("checked", true);
		if (!excepts_.contains("config-env")) {
			$(":checkbox[name='config-env']:enabled").attr("checked", false);
			$("#select-all-env").attr("checked", false);
		}
		if (!excepts_.contains("if-deploy")) {
			$("#if-deploy").attr("checked", false).triggerHandler("click");
		}
	}
	
	function resetConfigFormValidation() {
		$(".control-group").removeClass("error");
		$(".message").hide();
	}
	
	function getConfigKey($element_in_row) {
		return $element_in_row.parents(".config_row").find("[name='config_key']").val();
	}
	
	function getConfigType($element_in_row) {
		return $element_in_row.parents(".config_row").find("[name='config_type']").val();
	}
	
	function getConfigId($element_in_row) {
		return $element_in_row.parents(".config_row").find("[name='config_id']").val();
	}
	
	function bindConfigTableEvents() {
		$("[rel=tooltip]").tooltip({delay : {show : 800}});
		
		$("#display-all-btn").click(function() {
			display_all_btn = $(this).is(":checked");
			if (display_all_btn) {
				$(".config-btn-group .optional").removeClass("hide");
			} else {
				$(".config-btn-group .optional").addClass("hide");
			}
		});
		
		$(".clear-config-btn").click(function() {
			$clearAlert.dialog("open");
			$clearAlert.data("configId", getConfigId($(this)));
			return false;
		});
		
		$(".remove-config-btn").click(function() {
			$deleteAlert.dialog("open");
			$deleteAlert.data("configId", getConfigId($(this)));
			return false;
		});
		
		$(".deploy-config-btn").click(function() {
			$deployAlert.find(".key").html(getConfigKey($(this)).abbreviate(35));
			$deployAlert.data("configId", getConfigId($(this)));
			$deployAlert.dialog("open");
			return false;
		});
		
		$(".push-config-btn").click(function() {
			$pushAlert.find(".key").html(getConfigKey($(this)).abbreviate(35));
			$pushAlert.data("configId", getConfigId($(this)));
			$pushAlert.dialog("open");
			return false;
		});
		
		$(".moveup-config-btn").click(function() {
			$.ajax("/config/moveUpConfigAjax.vhtml".prependcontext(), {
				data : $.param({
					"projectId" : $("#projectId").val(),
					"configId" : getConfigId($(this))
				}, true),
				dataType : "json",
				success : function(result) {
					if (result.code == Res_Code_Success) {
						reloadConfigListTable();
					}
				}
			});
			return false;
		});
		
		$(".movedown-config-btn").click(function() {
			$.ajax("/config/moveDownConfigAjax.vhtml".prependcontext(), {
				data : $.param({
					"projectId" : $("#projectId").val(),
					"configId" : getConfigId($(this))
				}, true),
				dataType : "json",
				success : function(result) {
					if (result.code == Res_Code_Success) {
						reloadConfigListTable();
					}
				}
			});
			return false;
		});
		
		$("#add-config-btn").click(function() {
			$("#add-config-modal").modal({
				backdrop : "static", 
				keyboard : false
			});
			return false;
		});
		
		$(".edit-config-btn").click(function() {
			resetEditConfigForm();
			$("#edit-config-modal [name='config-id']").val(getConfigId($(this)));
			$("#edit-config-modal .config-key").text(getConfigKey($(this)));
			var config_type = getConfigType($(this));
			$("#edit-config-type-selector").val(config_type);
			$("[name='edit-config-env'][value='" + $("[name='envId']").val() + "']").attr("checked", true);
			$("#edit-config-value-container").html(generateValueComponent(parseInt(config_type), "edit-config-value"));
			$("#edit-config-modal").modal({
				backdrop : "static", 
				keyboard : false
			});
			return false;
		});
	}

});

function openMapEditor(inputId, event) {
	$config_map_editor.show({
		value : $("#" + inputId).val(),
		ok : function($editor) {
			var checkPass = true;
			var $errorInput = null;
			var trimInput = $editor.find(".trim_check").is(":checked");
			var map_result = "";
			if ($editor.find(".map-item").length > 0) {
				var map_obj = new Object();
				$editor.find(".map-item").each(function() {
					var key = $(this).find(".map-key-input").val();
					var value = $(this).find(".map-value-input").val();
					map_obj[key.trimIf(trimInput)] = value.trimIf(trimInput);
				});
				map_result = JSON.stringify(map_obj);
			}
			$("#" + inputId).val(map_result);
			$editor.modal("hide");
		}
	});
	event.preventDefault();
}

function openListEditor(inputId, numberlist, event) {
	$config_list_editor.show({
		value : $("#" + inputId).val(),
		title : (numberlist ? "List<Number>": "List<String>") + "编辑器",
		ok : function($editor) {
			var checkPass = true;
			var $errorInput = null;
			var trimInput = $editor.find(".trim_check").is(":checked");
			if (numberlist) {
				$editor.find(".list-item-input").each(function() {
					if (!$(this).val().trimIf(trimInput).isNumber()) {
						$(this).parent().addClass("error");
						checkPass = false;
						if ($errorInput == null) $errorInput = $(this);
					} else {
						$(this).parent().removeClass("error");
					}
				});
			}
			if (checkPass) {
				//回填
				var list_result = "";
				if ($editor.find(".list-item-input").length > 0) {
					var array = new Array();
					$editor.find(".list-item-input").each(function() {
						array.push($(this).val().trimIf(trimInput));
					});
					list_result = JSON.stringify(array);
				}
				$("#" + inputId).val(list_result);
				$editor.modal("hide");
			} else {
				$errorInput.select();
				$editor.find(".form-error").flashAlert("数字，必填!");
			}
		}
	});
	event.preventDefault();
}