import numpy as np

def fleiss_kappa(matrix) -> float:
    M = np.array(matrix)
    """
    Computes Fleiss' Kappa for assessing the reliability of agreement between a fixed number of raters 
    when assigning categorical ratings to a number of items.

    Parameters:
    M (numpy array): Matrix of shape (N, k), where N is the number of items, and k is the number of categories.
                     Each cell in the matrix M[i, j] represents the number of raters who assigned the i-th item to the j-th category.

    Returns:
    float: Fleiss' Kappa score.
    """
    N, k = M.shape
    n = np.sum(M[0, :])  # number of raters
    if not np.all(np.sum(M, axis=1) == n):
        raise ValueError("The number of raters must be the same for each item.")

    # Proportion of all assignments which were to the j-th category
    p = np.sum(M, axis=0) / (N * n)

    # Extent to which raters agree for the i-th subject
    P = (np.sum(M * M, axis=1) - n) / (n * (n - 1))

    # Mean of P
    P_bar = np.mean(P)

    # Mean of p
    P_e_bar = np.sum(p * p)

    # Handle the case where the denominator is zero
    if P_e_bar == 1:
        return 1.0 if P_bar == 1 else np.nan

    kappa = (P_bar - P_e_bar) / (1 - P_e_bar)
    return kappa

def kappa_to_text(k: float) ->str :
    if k < 0:
        return "Poor agreement"
    elif 0 <= k <= 0.20:
        return "Slight agreement"
    elif 0.21 <= k <= 0.40:
        return "Fair agreement"
    elif 0.41 <= k <= 0.60:
        return "Moderate agreement"
    elif 0.61 <= k <= 0.80:
        return "Substantial agreement"
    elif 0.81 <= k <= 1.00:
        return "Almost perfect agreement"
    else:
        return "Invalid Kappa value"