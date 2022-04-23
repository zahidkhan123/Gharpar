import React from "react";
import { Card, CardBody, CardTitle, Progress } from "reactstrap";

import IntlMessages from "../../helpers/IntlMessages";
import data from "../../data/profileStatuses";

const ProfileStatuses = ({cardClass="h-100"}) => {
  return (
    <Card className={cardClass}>
      <CardBody>
        <CardTitle>
          <IntlMessages id="Today Report" />
        </CardTitle>
        {data.map((s, index) => {
          return (
            <div key={index} className="mb-4">
              <p className="mb-2">
                {s.title}
                <span className="float-right text-muted">
                  {s.status}
                </span>
              </p>
              <Progress value={(s.status)} />
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
};
export default ProfileStatuses;
