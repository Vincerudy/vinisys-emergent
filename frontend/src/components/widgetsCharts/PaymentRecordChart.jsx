import React from 'react'
import ReactApexChart from 'react-apexcharts';
import { paymentRecordChartOption } from '@/utils/chartsLogic/paymentRecordChartOption';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';

const PaymentRecordChart = ({salesDataGraph}) => {
    const chartOptions = paymentRecordChartOption()
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();
console.log('console log ', salesDataGraph)

    if (isRemoved) {
        return null;
    }
    return (
        <div className="col-xxl-8">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "Chargement..." : ""}`}>
                <CardHeader title={"Graphique des ventes"} refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
                <div className="card-body custom-card-action p-0">
                    {salesDataGraph.series ? 
                        <ReactApexChart
                            options={salesDataGraph}
                            series={salesDataGraph.series}
                            height={377}
                        />
                        : ""
                    }
                </div>
 
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default PaymentRecordChart

const Card = ({ title, price, progress, bg_color }) => {
    return (
        <div className="col-lg-3">
            <div className="p-3 border border-dashed rounded">
                <div className="fs-12 text-muted mb-1">{title}</div>
                <h6 className="fw-bold text-dark">${price}</h6>
                <div className="progress mt-2 ht-3">
                    <div className={`progress-bar ${bg_color}`} role="progressbar" style={{ width: progress }}></div>
                </div>
            </div>
        </div>
    )
}