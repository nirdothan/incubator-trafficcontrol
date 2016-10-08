/*
 * Copyright 2016 Comcast Cable Communications Management, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.comcast.cdn.traffic_control.traffic_router.secure;

import com.comcast.cdn.traffic_control.traffic_router.shared.CertificateData;

import javax.management.AttributeChangeNotification;
import javax.management.Notification;
import javax.management.NotificationListener;
import java.util.ArrayList;
import java.util.List;

public class CertificateDataListener implements NotificationListener {
	private final static org.apache.juli.logging.Log log = org.apache.juli.logging.LogFactory.getLog(CertificateDataListener.class);

	@SuppressWarnings("PMD.AvoidCatchingThrowable")
	@Override
	public void handleNotification(final Notification notification, final Object handback) {
		if (!(notification instanceof AttributeChangeNotification)) {
			return;
		}

		List<CertificateData> certificateDataList = new ArrayList<>();

		final Object newValue = ((AttributeChangeNotification) notification).getNewValue();

		if (certificateDataList.getClass().isInstance(newValue)) {
			certificateDataList = (List<CertificateData>) newValue;
			try {
				CertificateRegistry.getInstance().importCertificateDataList(certificateDataList);
			} catch (Throwable t) {
				log.warn("Failed importing certificate data list into registry " + t.getClass().getSimpleName(), t);
			}
		}
	}
}
