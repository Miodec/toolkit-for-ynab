import Highcharts from 'highcharts';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { localizedMonthAndYear, sortByGettableDate } from 'toolkit/extension/utils/date';
import { l10n } from 'toolkit/extension/utils/toolkit';
import { FiltersPropType } from 'toolkit-reports/common/components/report-context/component';
import { Legend } from './components/legend';
import { Collections } from 'toolkit/extension/utils/collections';

export class NeedsWantsSavingsComponent extends React.Component {
  static propTypes = {
    filters: PropTypes.shape(FiltersPropType),
    filteredTransactions: PropTypes.array.isRequired,
  };

  state = {};

  componentDidMount() {
    this._calculateData();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.filters !== prevProps.filters ||
      this.props.filteredTransactions !== prevProps.filteredTransactions
    ) {
      this._calculateData();
    }
  }

  render() {
    return (
      <div className="tk-flex tk-flex-column tk-flex-grow">
        <div className="tk-flex tk-justify-content-end">
          {this.state.hoveredData && (
            <Legend
              label={this.state.hoveredData.label}
              needs={this.state.hoveredData.needs}
              wants={this.state.hoveredData.wants}
              savings={this.state.hoveredData.savings}
              unknown={this.state.hoveredData.unknown}
              needsPercent={this.state.hoveredData.needsPercent}
              wantsPercent={this.state.hoveredData.wantsPercent}
              savingsPercent={this.state.hoveredData.savingsPercent}
              unknownPercent={this.state.hoveredData.unknownPercent}
            />
          )}
        </div>
        <div className="tk-highcharts-report-container" id="tk-net-worth-chart" />
      </div>
    );
  }

  _renderReport = () => {
    const _this = this;
    const { needs, wants, savings, unknown, labels } = this.state.reportData;
    const averageData = this.state.averageData;

    const pointHover = {
      events: {
        mouseOver: function () {
          _this.setState({
            hoveredData: {
              label: labels[this.index],
              needs: needs[this.index],
              wants: wants[this.index],
              savings: savings[this.index],
              unknown: unknown[this.index],
              needsPercent: Math.round(
                (needs[this.index] /
                  (needs[this.index] +
                    wants[this.index] +
                    savings[this.index] +
                    unknown[this.index])) *
                  100
              ),
              wantsPercent: Math.round(
                (wants[this.index] /
                  (needs[this.index] +
                    wants[this.index] +
                    savings[this.index] +
                    unknown[this.index])) *
                  100
              ),
              savingsPercent: Math.round(
                (savings[this.index] /
                  (needs[this.index] +
                    wants[this.index] +
                    savings[this.index] +
                    unknown[this.index])) *
                  100
              ),
              unknownPercent: Math.round(
                (unknown[this.index] /
                  (needs[this.index] +
                    wants[this.index] +
                    savings[this.index] +
                    unknown[this.index])) *
                  100
              ),
            },
          });
        },
        mouseOut: function () {
          _this.setState({
            hoveredData: averageData,
          });
        },
      },
    };

    const chart = new Highcharts.Chart({
      credits: false,
      chart: {
        backgroundColor: 'transparent',
        renderTo: 'tk-net-worth-chart',
      },
      legend: { enabled: false },
      title: { text: '' },
      tooltip: { enabled: false },
      xAxis: {
        categories: labels,
        labels: {
          style: { color: 'var(--label_primary)' },
        },
      },
      yAxis: {
        title: { text: '' },
        labels: {
          // formatter: function () {
          //   return formatCurrency(this.value);
          // },
          formatter: function () {
            return this.value + '%';
          },
          style: { color: 'var(--label_primary)' },
        },
      },
      plotOptions: {
        column: {
          stacking: 'percent',
        },
        series: {
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
      },
      series: [
        {
          id: 'unknown',
          type: 'column',
          name: l10n('toolkit.unknown', 'Unknown'),
          color: 'gray',
          data: unknown,
          pointPadding: 0,
          point: pointHover,
        },
        {
          id: 'savings',
          type: 'column',
          name: l10n('toolkit.savings', 'Savings'),
          color: '#2196F3',
          data: savings,
          pointPadding: 0,
          point: pointHover,
        },
        {
          id: 'wants',
          type: 'column',
          name: l10n('toolkit.wants', 'Wants'),
          color: '#4CAF50',
          data: wants,
          pointPadding: 0,
          point: pointHover,
        },
        {
          id: 'needs',
          type: 'column',
          name: l10n('toolkit.needs', 'Needs'),
          color: '#E53935',
          data: needs,
          pointPadding: 0,
          point: pointHover,
        },
      ],
    });

    this.setState({ chart });
  };

  _calculateData() {
    if (!this.props.filters) {
      return;
    }

    const allReportData = { inflows: [], outflows: [], labels: [] };
    const transactions = this.props.filteredTransactions.slice().sort(sortByGettableDate);

    // const categoriesType = new Map();

    // console.log(this.props);
    // console.log(Collections.subCategoriesCollection);

    let lastMonth = null;
    const categoryNwsMap = new Map();
    const data = {
      needs: [],
      wants: [],
      savings: [],
      unknown: [],
    };

    function pushData() {
      // console.log(
      //   'missing ',
      //   totalIncome * -1 - (currentNeeds + currentWants + currentSavings + currentUnknown)
      // );
      // console.log(totalIncome, currentNeeds, currentWants, currentSavings, currentUnknown);
      let savings = currentSavings;

      let net = totalIncome * -1 - (currentNeeds + currentWants + currentSavings + currentUnknown);
      if (net > 0) {
        net = 0;
      }

      savings += net;

      let needs = currentNeeds;
      if (needs > 0) {
        savings += needs * -1;
        needs = 0;
      }

      let wants = currentWants;
      if (wants > 0) {
        savings += wants * -1;
        wants = 0;
      }

      data.needs.push(needs * -1);
      data.wants.push(wants * -1);
      data.savings.push(savings * -1);
      data.unknown.push(currentUnknown * -1);
      currentNeeds = 0;
      currentWants = 0;
      currentSavings = 0;
      currentUnknown = 0;
      totalIncome = 0;
    }

    let currentNeeds = 0;
    let currentWants = 0;
    let currentSavings = 0;
    let currentUnknown = 0;
    let totalIncome = 0;
    transactions.forEach((transaction) => {
      const transactionMonth = transaction.get('date').clone().startOfMonth();
      if (lastMonth === null) {
        lastMonth = transactionMonth;
      }

      // we're on a new month
      if (transactionMonth.toISOString() !== lastMonth.toISOString()) {
        // pushCurrentAccountData();
        pushData();
        lastMonth = transactionMonth;
      }

      const transactionCategoryId = transaction.get('subCategoryId');

      if (transaction.get('subCategoryNameWrapped') === 'Inflow: Ready to Assign') {
        totalIncome += transaction.get('amount');
        return;
      }

      if (
        !transactionCategoryId
        // || transaction.get('transferAccountId') !== null
      )
        return;

      if (categoryNwsMap.has(transactionCategoryId)) {
        const value = categoryNwsMap.get(transactionCategoryId);
        if (value === 'needs') {
          currentNeeds += transaction.get('amount');
        } else if (value === 'wants') {
          currentWants += transaction.get('amount');
        } else if (value === 'savings') {
          currentSavings += transaction.get('amount');
        } else {
          currentUnknown += transaction.get('amount');
          console.log(
            transaction.get('payeeName'),
            transaction.get('subCategoryNameWrapped'),
            transaction
          );
        }
      } else {
        const category =
          Collections.subCategoriesCollection.findItemByEntityId(transactionCategoryId);
        const categoryNote = category.note;
        if (!categoryNote) {
          currentUnknown += transaction.get('amount');
          categoryNwsMap.set(transactionCategoryId, 'unknown');
        } else if (categoryNote.includes('[nws:needs]')) {
          currentNeeds += transaction.get('amount');
          categoryNwsMap.set(transactionCategoryId, 'needs');
        } else if (categoryNote.includes('[nws:wants]')) {
          currentWants += transaction.get('amount');
          categoryNwsMap.set(transactionCategoryId, 'wants');
        } else if (categoryNote.includes('[nws:savings]')) {
          currentSavings += transaction.get('amount');
          categoryNwsMap.set(transactionCategoryId, 'savings');
        } else {
          currentUnknown += transaction.get('amount');
          categoryNwsMap.set(transactionCategoryId, 'unknown');
          console.log(
            transaction.get('payeeName'),
            transaction.get('subCategoryNameWrapped'),
            transaction
          );
        }
      }
    });

    console.log(data);

    if (
      lastMonth &&
      allReportData.labels[allReportData.labels.length - 1] !== localizedMonthAndYear(lastMonth)
    ) {
      // pushCurrentAccountData();
      pushData();
    }

    // make sure we have a label for any months which have empty data
    const { fromDate, toDate } = this.props.filters.dateFilter;
    if (transactions.length) {
      let currentIndex = 0;
      const transactionMonth = transactions[0].get('date').clone().startOfMonth();
      const lastFilterMonth = toDate.clone().addMonths(1).startOfMonth();
      while (transactionMonth.isBefore(lastFilterMonth)) {
        if (!allReportData.labels.includes(localizedMonthAndYear(transactionMonth))) {
          const { inflows, outflows, labels } = allReportData;
          labels.splice(currentIndex, 0, localizedMonthAndYear(transactionMonth));
          inflows.splice(currentIndex, 0, inflows[currentIndex - 1] || 0);
          outflows.splice(currentIndex, 0, outflows[currentIndex - 1] || 0);
        }

        currentIndex++;
        transactionMonth.addMonths(1);
      }
    }

    // Net Worth is calculated from the start of time so we need to handle "filters" here
    // rather than using `filteredTransactions` from context.
    const { labels } = allReportData;
    let startIndex = labels.findIndex((label) => label === localizedMonthAndYear(fromDate));
    startIndex = startIndex === -1 ? 0 : startIndex;
    let endIndex = labels.findIndex((label) => label === localizedMonthAndYear(toDate));
    endIndex = endIndex === -1 ? labels.length + 1 : endIndex + 1;

    const filteredLabels = labels.slice(startIndex, endIndex);
    const filteredNeeds = data.needs.slice(startIndex, endIndex);
    const filteredWants = data.wants.slice(startIndex, endIndex);
    const filteredSavings = data.savings.slice(startIndex, endIndex);
    const filteredUnknown = data.unknown.slice(startIndex, endIndex);

    const averages = {
      needs: filteredNeeds.reduce((a, b) => a + b, 0) / filteredNeeds.length,
      wants: filteredWants.reduce((a, b) => a + b, 0) / filteredWants.length,
      savings: filteredSavings.reduce((a, b) => a + b, 0) / filteredSavings.length,
      unknown: filteredUnknown.reduce((a, b) => a + b, 0) / filteredUnknown.length,
    };

    const averageData = {
      label: 'Average',
      needs: averages.needs,
      wants: averages.wants,
      savings: averages.savings,
      unknown: averages.unknown,
      needsPercent: Math.round(
        (averages.needs / (averages.needs + averages.wants + averages.savings + averages.unknown)) *
          100
      ),
      wantsPercent: Math.round(
        (averages.wants / (averages.needs + averages.wants + averages.savings + averages.unknown)) *
          100
      ),
      savingsPercent: Math.round(
        (averages.savings /
          (averages.needs + averages.wants + averages.savings + averages.unknown)) *
          100
      ),
      unknownPercent: Math.round(
        (averages.unknown /
          (averages.needs + averages.wants + averages.savings + averages.unknown)) *
          100
      ),
    };

    this.setState(
      {
        hoveredData: averageData,
        averageData,
        reportData: {
          labels: filteredLabels,
          needs: filteredNeeds,
          wants: filteredWants,
          savings: filteredSavings,
          unknown: filteredUnknown,
        },
      },
      this._renderReport
    );
  }
}
