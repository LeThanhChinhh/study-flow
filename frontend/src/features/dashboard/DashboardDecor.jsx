import AppBackground from '../../components/background/AppBackground'

/**
 * Backward-compatible export for older imports.
 * New pages should use AppBackground with an explicit page variant.
 */
export const StudyOrbitBackdrop = () => <AppBackground variant="dashboard" />
