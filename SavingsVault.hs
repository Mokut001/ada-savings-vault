{-# INLINABLE mkValidator #-}
mkValidator :: SavingsDatum -> () -> ScriptContext -> Bool
mkValidator datum _ ctx = 
    traceIfFalse "Target not reached" targetReached &&
    traceIfFalse "Wrong beneficiary" signedByBeneficiary
  where
    info = scriptContextTxInfo ctx
    signedByBeneficiary = txSignedBy info (beneficiary datum)
    
    -- Checks if total value at address matches goal
    scriptOutputValue = valueLockedBy info (ownHash ctx)
    targetReached = getLovelace (fromValue scriptOutputValue) >= targetAmount datum

data SavingsDatum = SavingsDatum 
    { beneficiary  :: PaymentPubKeyHash
    , targetAmount :: Integer 
    -- deadline could be added here to enforce time lock
    }