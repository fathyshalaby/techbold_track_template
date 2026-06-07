ARG BASE_IMAGE=sda-sandbox-base:latest
FROM ${BASE_IMAGE}

ARG CUSTOMER_APP_SERVICE=customer-app
ARG CUSTOMER_APP_PORT=8088
ARG DASHBOARD_SERVICE=ops-dashboard
ARG DASHBOARD_PORT=3000
ARG INGEST_SERVICE=signal-ingest
ARG INGEST_PORT=9091
ARG AGENT_SERVICE=signal-agent
ARG CONFIG_FILE=/etc/signal-agent/config.env
ARG CORRECT_ENDPOINT=http://127.0.0.1:9091/ingest
ARG BAD_ENDPOINT=http://127.0.0.1:9092/ingest

RUN install -d -m 755 /opt/${CUSTOMER_APP_SERVICE} /opt/${DASHBOARD_SERVICE} /opt/${INGEST_SERVICE} /opt/${AGENT_SERVICE} /opt/hackathon "$(dirname "${CONFIG_FILE}")" \
  && install -d -m 755 -o azureuser -g azureuser /var/lib/${INGEST_SERVICE} \
  && printf 'METRICS_ENDPOINT=%s\n' "${CORRECT_ENDPOINT}" > "${CONFIG_FILE}"

COPY archetypes/monitoring-data/customer_app.py /opt/${CUSTOMER_APP_SERVICE}/customer_app.py
COPY archetypes/monitoring-data/dashboard.py /opt/${DASHBOARD_SERVICE}/dashboard.py
COPY archetypes/monitoring-data/signal_ingest.py /opt/${INGEST_SERVICE}/signal_ingest.py
COPY archetypes/monitoring-data/signal_agent.py /opt/${AGENT_SERVICE}/signal_agent.py
COPY archetypes/monitoring-data/customer-app.service.template /tmp/customer-app.service.template
COPY archetypes/monitoring-data/dashboard.service.template /tmp/dashboard.service.template
COPY archetypes/monitoring-data/signal-ingest.service.template /tmp/signal-ingest.service.template
COPY archetypes/monitoring-data/signal-agent.service.template /tmp/signal-agent.service.template
COPY archetypes/monitoring-data/break.sh.template /opt/hackathon/break.sh
COPY archetypes/monitoring-data/public-test.sh.template /opt/hackathon/public-test.sh
COPY archetypes/monitoring-data/case.json.template /opt/hackathon/case.json

RUN sed -i "s|__CUSTOMER_APP_SERVICE__|${CUSTOMER_APP_SERVICE}|g; s|__CUSTOMER_APP_PORT__|${CUSTOMER_APP_PORT}|g; s|__DASHBOARD_SERVICE__|${DASHBOARD_SERVICE}|g; s|__DASHBOARD_PORT__|${DASHBOARD_PORT}|g; s|__INGEST_SERVICE__|${INGEST_SERVICE}|g; s|__INGEST_PORT__|${INGEST_PORT}|g; s|__AGENT_SERVICE__|${AGENT_SERVICE}|g; s|__CONFIG_FILE__|${CONFIG_FILE}|g; s|__CORRECT_ENDPOINT__|${CORRECT_ENDPOINT}|g; s|__BAD_ENDPOINT__|${BAD_ENDPOINT}|g" \
      /tmp/customer-app.service.template /tmp/dashboard.service.template /tmp/signal-ingest.service.template /tmp/signal-agent.service.template /opt/hackathon/break.sh /opt/hackathon/public-test.sh /opt/hackathon/case.json \
  && mv /tmp/customer-app.service.template /etc/systemd/system/${CUSTOMER_APP_SERVICE}.service \
  && mv /tmp/dashboard.service.template /etc/systemd/system/${DASHBOARD_SERVICE}.service \
  && mv /tmp/signal-ingest.service.template /etc/systemd/system/${INGEST_SERVICE}.service \
  && mv /tmp/signal-agent.service.template /etc/systemd/system/${AGENT_SERVICE}.service \
  && chmod +x /opt/hackathon/break.sh /opt/hackathon/public-test.sh \
  && systemctl enable ${CUSTOMER_APP_SERVICE}.service ${DASHBOARD_SERVICE}.service ${INGEST_SERVICE}.service ${AGENT_SERVICE}.service

STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
