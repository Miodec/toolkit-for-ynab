import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { NeedsWantsSavingsComponent } from './component';

function mapReportContextToProps(context) {
  return {
    filteredTransactions: context.filteredTransactions,
    filters: context.filters,
  };
}

export const NeedsWantsSavings = withReportContext(mapReportContextToProps)(
  NeedsWantsSavingsComponent
);
