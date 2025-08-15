import React from 'react'
import { Link } from 'react-router-dom'
import CardHeader from '@/components/shared/CardHeader'
import { upcomingScheduleList } from '@/utils/fackData/upcomingScheduleList'
import ImageGroup from '@/components/shared/ImageGroup'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'

const Schedule = ({ title, facturesRetard, onFactureClick }) => {

    console.log('facturesRetard', facturesRetard)
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions();

    if (isRemoved) {
        return null;
    }
    return (
        <div className="col-xxl-4">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title={title}  />

                <div className="card-body" style={{height: '400px', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '10px' }}> 
                {
                        facturesRetard
                            .sort((a, b) => a.retard - b.retard)  // Tri des factures par retard, du plus petit au plus grand
                            .map((facture) => {
                                return (
                                    <div 
                                        key={facture.id} 
                                        className="p-3 border border-dashed rounded-3 schedule-card"
                                        onClick={() => onFactureClick && onFactureClick(facture)}
                                        style={{ cursor: onFactureClick ? 'pointer' : 'default' }}
                                    >
                                        <div className="d-flex justify-content-between">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`wd-50 ht-50 lh-1 d-flex align-items-center justify-content-center flex-column rounded-2 bg-soft-danger text-danger schedule-date`}>
                                                    <span className="fs-18 fw-bold mb-1 d-block">{facture.retard}</span>
                                                    <span className="fs-10 fw-semibold text-uppercase d-block">Jours</span>
                                                </div>
                                                <div className="text-dark">
                                                    <span className="fw-bold mb-2 text-truncate-1-line d-block">Facture N°{facture.invoiceNumber} - {facture.date}</span>
                                                    <span className="fs-11 fw-normal text-muted text-truncate-1-line">Client :  {facture.client}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                    }
                </div>

                
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default Schedule
