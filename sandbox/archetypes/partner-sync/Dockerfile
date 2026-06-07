FROM ubuntu:22.04

ENV container=docker
ENV DEBIAN_FRONTEND=noninteractive
ARG BENCH_PUBLIC_KEY
ARG PARTNER_SERVICE=partner-gateway
ARG SYNC_SERVICE=order-relay
ARG PARTNER_HOST=vendor-api.internal
ARG GOOD_IP=127.0.0.1
ARG BAD_IP=127.0.0.2
ARG PARTNER_PORT=9000
ARG STATUS_PATH=/var/lib/order-relay/status.json

COPY archetypes/common/setup-base.sh /tmp/setup-base.sh
RUN chmod +x /tmp/setup-base.sh && /tmp/setup-base.sh "$BENCH_PUBLIC_KEY"

RUN install -d -m 755 /opt/${PARTNER_SERVICE} /opt/${SYNC_SERVICE} /opt/hackathon \
  && install -d -m 755 -o azureuser -g azureuser "$(dirname "${STATUS_PATH}")"

COPY archetypes/partner-sync/partner_api.py /opt/${PARTNER_SERVICE}/partner_api.py
COPY archetypes/partner-sync/order_relay.py /opt/${SYNC_SERVICE}/order_relay.py
COPY archetypes/partner-sync/partner-gateway.service.template /tmp/partner-gateway.service.template
COPY archetypes/partner-sync/order-relay.service.template /tmp/order-relay.service.template
COPY archetypes/partner-sync/break.sh.template /opt/hackathon/break.sh
COPY archetypes/partner-sync/public-test.sh.template /opt/hackathon/public-test.sh
COPY archetypes/partner-sync/case.json.template /opt/hackathon/case.json

RUN sed -i "s|__PARTNER_SERVICE__|${PARTNER_SERVICE}|g; s|__SYNC_SERVICE__|${SYNC_SERVICE}|g; s|__PARTNER_HOST__|${PARTNER_HOST}|g; s|__GOOD_IP__|${GOOD_IP}|g; s|__BAD_IP__|${BAD_IP}|g; s|__PARTNER_PORT__|${PARTNER_PORT}|g; s|__STATUS_PATH__|${STATUS_PATH}|g" \
      /tmp/partner-gateway.service.template /tmp/order-relay.service.template /opt/hackathon/break.sh /opt/hackathon/public-test.sh /opt/hackathon/case.json \
  && mv /tmp/partner-gateway.service.template /etc/systemd/system/${PARTNER_SERVICE}.service \
  && mv /tmp/order-relay.service.template /etc/systemd/system/${SYNC_SERVICE}.service \
  && chmod +x /opt/hackathon/break.sh /opt/hackathon/public-test.sh \
  && systemctl enable ${PARTNER_SERVICE}.service ${SYNC_SERVICE}.service

STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
