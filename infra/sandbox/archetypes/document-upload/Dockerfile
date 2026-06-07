ARG BASE_IMAGE=sda-sandbox-base:latest
FROM ${BASE_IMAGE}

ARG SERVICE_NAME=document-hub
ARG SERVICE_USER=docsvc
ARG SERVICE_UID=1999
ARG SERVICE_PORT=8081
ARG ROOT_DIR=/srv/document-hub
ARG UPLOAD_DIR=/srv/document-hub/uploads
ARG EXISTING_DIR=/srv/document-hub/existing

RUN useradd -u ${SERVICE_UID} -r -m -s /usr/sbin/nologin ${SERVICE_USER} \
  && install -d -m 755 -o ${SERVICE_USER} -g ${SERVICE_USER} ${ROOT_DIR} ${UPLOAD_DIR} ${EXISTING_DIR} /opt/${SERVICE_NAME} /opt/hackathon \
  && printf 'existing document\n' > ${EXISTING_DIR}/welcome.txt \
  && chown ${SERVICE_USER}:${SERVICE_USER} ${EXISTING_DIR}/welcome.txt

COPY archetypes/document-upload/document_hub.py /opt/${SERVICE_NAME}/service.py
COPY archetypes/document-upload/document-hub.service.template /tmp/document-hub.service.template
COPY archetypes/document-upload/break.sh.template /opt/hackathon/break.sh
COPY archetypes/document-upload/public-test.sh.template /opt/hackathon/public-test.sh
COPY archetypes/document-upload/case.json.template /opt/hackathon/case.json

RUN sed -i "s|__SERVICE_NAME__|${SERVICE_NAME}|g; s|__SERVICE_USER__|${SERVICE_USER}|g; s|__SERVICE_PORT__|${SERVICE_PORT}|g; s|__ROOT_DIR__|${ROOT_DIR}|g; s|__UPLOAD_DIR__|${UPLOAD_DIR}|g; s|__EXISTING_DIR__|${EXISTING_DIR}|g" \
      /tmp/document-hub.service.template /opt/hackathon/break.sh /opt/hackathon/public-test.sh /opt/hackathon/case.json \
  && mv /tmp/document-hub.service.template /etc/systemd/system/${SERVICE_NAME}.service \
  && chmod +x /opt/hackathon/break.sh /opt/hackathon/public-test.sh \
  && systemctl enable ${SERVICE_NAME}.service

STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
