import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Currency } from 'toolkit-reports/common/components/currency';
// import { Percentage } from 'toolkit-reports/common/components/percentage';
import './styles.scss';
// import classnames from 'classnames';

export const Legend = (props) => (
  <React.Fragment>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-mg-0">&nbsp;</div>
      </div>
      <div className="tk-needs-wants-savings-legend__text-faded">{props.label}</div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-needs-wants-savings-legend__icon-needs" />
        <div className="tk-mg-l-05">Needs</div>
      </div>
      <div>
        <Currency value={props.needs} />
      </div>
      <div>{props.needsPercent}%</div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-needs-wants-savings-legend__icon-wants" />
        <div className="tk-mg-l-05">Wants</div>
      </div>
      <div>
        <Currency value={props.wants} />
      </div>
      <div>{props.wantsPercent}%</div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-needs-wants-savings-legend__icon-savings" />
        <div className="tk-mg-l-05">Savings</div>
      </div>
      <div>
        <Currency value={props.savings} />
      </div>
      <div>{props.savingsPercent}%</div>
    </div>
    <div className="tk-mg-05 tk-pd-r-1 tk-border-r">
      <div className="tk-flex tk-mg-b-05 tk-align-items-center">
        <div className="tk-needs-wants-savings-legend__icon-unknown" />
        <div className="tk-mg-l-05">Unknown</div>
      </div>
      <div>
        <Currency value={props.unknown} />
      </div>
      <div>{props.unknownPercent}%</div>
    </div>
  </React.Fragment>
);

Legend.propTypes = {
  needs: PropTypes.number.isRequired,
  wants: PropTypes.number.isRequired,
  savings: PropTypes.number.isRequired,
  unknown: PropTypes.number.isRequired,
};
