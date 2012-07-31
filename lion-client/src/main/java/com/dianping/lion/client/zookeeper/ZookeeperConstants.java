/**
 * Project: com.dianping.lion.lion-client-0.3.0
 * 
 * File Created at 2012-7-29
 * $Id$
 * 
 * Copyright 2010 dianping.com.
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Dianping Company. ("Confidential Information").  You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with dianping.com.
 */
package com.dianping.lion.client.zookeeper;

/**
 * @author danson.liu
 *
 */
public interface ZookeeperConstants {

	int DEFAULT_SESSION_TIMEOUT = 60000;
	
	String PATH_DP = "/DP";
	String PATH_CONFIG = PATH_DP + "/CONFIG";
	String NODE_CONTEXTVAL = "CONTEXTVALUE";
	String NODE_TIMESTAMP = "TIMESTAMP";
	String CONFIG_CHARSET = "UTF-8";

}
